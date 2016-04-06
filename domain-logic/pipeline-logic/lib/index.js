var async = require('async');
var request = require('request');
var moment = require("moment");

var constants = require('./constants');
var corpus2graphPipeline = require('corpus2graph-pipeline');
var pipelineConstants = corpus2graphPipeline.constants;
var Database = corpus2graphPipeline.database;

var NCBIService = require('./ncbiService');

var MAX_RESULTS = 10000;

var ERRORS = {
  NOT_ACCESSIBLE: 1
}

function pipelineLogic(config, options) {

  options = options || {};
  var db = options.database ||new Database(config.sql);
  var service = new NCBIService(config);
  
  // expecting SCORING_SERVICES in the following format: name1::url1;name2::url2
  var scoringServices = [];
  var scoringServicesVar = config.services.scoringConfig;
  scoringServicesVar.split(';').forEach(function(scoringService){
    var elements = scoringService.split('::');
    scoringServices.push({
      id: elements[0],
      url: elements[1]
    });
  });

  if (!scoringServices.length) throw new Error('no scoring services were found. Make sure urls are in the format: "name1::url1;name2::url2"');

  // Methods

  function getNewUnprocessedDocumentIDs(dateFrom, dateTo, cb) {
    var pdaTimeSpan = moment(dateFrom).format('"YYYY/MM/DD"') + '[EDAT] : ' + moment(dateTo).format('"YYYY/MM/DD"') + '[EDAT]';
    var allDocuments = { documents: [] };
    
    console.info("Searching for documents in", pdaTimeSpan);
    
    // Calling get documents for all sources
    return async.each(Object.keys(constants.dbs), function (dbName, cb) {
      
      var db = constants.dbs[dbName];
      
      // Filtering only databased marked as active
      if (!db.active) {
        console.info('Skipping database', dbName);
        return cb();
      }
      
      return runSearchRequest(dbName, 0, cb);
      
    }, function (err) {
        if (err) {
          console.error('Completed retrieving db new ids. There was a problem scanning the %s\nError:\n%s', pdaTimeSpan, err);
          return cb(err);
        }
        
        console.info('Completed retrieving db new ids on date span %s. Filtering only new ids...', pdaTimeSpan);
        
        return checkDocuments(allDocuments.documents, function (err, documents) {
          if (err) {
            console.error(err);
            return cb(err);
          }
          
          console.info('filtered %s documents', documents.length);
          return cb(null, documents);
        });
    });
    
    function runSearchRequest(database, startIndex, cb) {
        
      // Request Ids for specified page
      service.searchRequest(database, [pdaTimeSpan], MAX_RESULTS, startIndex, constants.etypes.edat, -1, function (err, res, cache) {
        if (err) {
          console.error(err);
          return cb(err);
        }
        
        console.info('results return from db %s on dates %s', cache.database, pdaTimeSpan);
        
        // insert current result batch into array
        var dbName = cache.database;
        
        // Get source id by db name
        var sourceId = constants.sources[constants.dbs[dbName].source];
        var documents = res.idlist.map(function (docId) {
          return {
            sourceId: sourceId,
            docId: docId + ''
          };
        });
        console.info('db %s on dates %s with result count %s', cache.database, pdaTimeSpan, documents.length);
        allDocuments.documents = allDocuments.documents.concat(documents);
        
        // We have more than one page and this is the first page
        var totalCount = parseInt(res.sount);
        var pageCount = parseInt(res.retmax);
        if (startIndex == 0 && pageCount < totalCount) {
          // Prepare start index for each page
          var pageStartIndexes = [];
          for (var i = pageCount; i < totalCount; i += MAX_RESULTS) {
            pageStartIndexes.push(i);
          }
          
          // Request ids for each page start index 
          return async.each(pageStartIndexes, function (pageStartIndex, cb) {
            return runSearchRequest(database, pageStartIndex, cb);
          }, cb);
        }
        
        return cb();
      });
    }
  }
  
  function checkDocuments(docIds, cb) {
      
    var reqParams = { docs: docIds };
    db.getUnprocessedDocuments(reqParams, function (err, result) {
        if (err) {
            console.error(err);
            return cb(err);
        }
        
        return cb(null, result.docs);
    });
  }
  
  /**
   * Get all sentences from document
   * Sample: in the stub samples folder taken from here: http://104.197.190.17/doc/pmc/2000354
   */
  function getDocumentSentences(docId, sourceId, cb) {
      
    var source = constants.sourcesById[sourceId];
    var urlRequest = config.services.docServiceUrl + '/doc/' + source + '/' + docId;
    console.info('calling', urlRequest);

    var opts = {
        url: urlRequest,
        timeout: config.http.timeoutMsec
    };
    return request(opts, function(err, resp, body) {
      if (err) return cb(err);
      
      // TODO: this is a temporary code to 
      // handle unaccessible documents
      // asked Giovanny to return statusCode 401 so that 
      // we can check this instead of parsing the text
      if (body.indexOf('document not fetched') > 0) {
        var err = new Error('Document is not accessible');
        err.errorCode = ERRORS.NOT_ACCESSIBLE;
        return checkDocumentRetreivalError(err, cb);
      }
            
      var sentencesArray;
      try {
          sentencesArray = JSON.parse(body);
      } catch (e) {
          console.error('error parsing sentences to JSON', body, e);
          return cb(e);
      }

      console.log('got response for doc', docId, body);
      
      if (!sentencesArray || !sentencesArray.sentences || !Array.isArray(sentencesArray.sentences)) {
        console.error('Returned JSON is not an array', body);
        return cb(new Error('Returned JSON is not an array'));
      }
      
      return cb(null, sentencesArray);
    });
  }

  function getScoring(message, cb) {
    
    // Checking message validity
    if (!message || !message.data) {
      var err = new Error('scoring message was not in the correct format');
      console.error('Error scoring data', err);
      return cb(err);
    }
      
    // Checking data validity
    var data = message.data
    if (!data || !data.sentence || !data.mentions) {
      var err = new Error('received data is not in the correct format');
      console.error('Error scoring data', err);
      return cb(err);
    }
    
    var finalEntities = [];
    var finalRelations = [];

    var entitiesHash = {};
    var relationsHash = {};

    // For each scoring service url, request a scoring
    return async.each(scoringServices, scoreWithService,
      
      // When done scoring with all services, return the results with callback
      function (err) {
        if (err) return cb(err);

        var result = { entities: finalEntities, relations: finalRelations };
        message.log('finished processing scoring for sentence: %j', result);
        return cb(null, result);
      }
    );
    
    function scoreWithService(scoringService, cb) {

        var opts = {
          url: scoringService.url,
          method: 'post',
          json: {
            text: data.sentence,
            entities: data.mentions
          }
        };
        
        message.log('requesting scoring', JSON.stringify(opts));
        
        return request(opts, function (err, resp, body) {
          message.log('body', JSON.stringify(body));
          
          if (err) return cb(err);
          if (resp.statusCode !== 200) return cb(new Error('error: statusCode=' + resp.statusCode));
          
          var relations = body && body.relations || [];
          relations.forEach(function (relation) {
            
            var entities = relation.entities || []; 
            entities = entities.map(function (entity) {
              return {
                typeId: constants.conceptTypes[entity.type.toUpperCase()],
                id: entity.id || entity.value,
                name: entity.value
              }
            });
            
            entities.forEach(function (entity) {
              var key = entity.type + '~' + entity.id;
              if (!entitiesHash[key]) {
                entitiesHash[key] = 1;
                finalEntities.push(entity);
              }
            });
            
            // check that we have at least one mirna and one gene
            var genes = entities.filter(function (entity) {
              return entity.typeId === constants.conceptTypes.GENE ? entity : null;
            });

            var mirnas = entities.filter(function (entity) {
              return entity.typeId === constants.conceptTypes.MIRNA ? entity : null;
            });
            
            mirnas.forEach(function (mirna) {
              genes.forEach(function (gene) {
                var key = scoringService.id + '~' + mirna.id + '~' + gene.id;
                if (relationsHash[key]) return;
                relationsHash[key] = 1;
                finalRelations.push({
                  scoringServiceId: scoringService.id,
                  modelVersion: body.modelVersion,
                  entity1: mirna,
                  entity2: gene,
                  relation: relation.class || relation.classification,
                  score: relation.score,
                  data: {
                    entity1: {
                      from: mirna.from || 0, 
                      to: mirna.to || 0
                    },
                    entity2: { 
                      from: gene.from || 0, 
                      to: gene.to || 0
                    }
                  }
                });
              })
            });
          });
          return cb();
        });
      }
  }

  function checkDocumentRetreivalError(err, cb) {
    // the document is not accessible, no point in retrying.
    // we should delete it from the queue
    if (err.errorCode == ERRORS.NOT_ACCESSIBLE) {
      
      // mark status as NOT ACCESSIBLE in the DB
      var updateStatusOpts = {
        sourceId: data.sourceId,
        docId: data.docId,
        statusId: pipelineConstants.documentStatus.NOT_ACCESSIBLE
      };
      return db.updateDocumentStatus(updateStatusOpts, function (err) { 
        if (err) {
          message.error('error updating document status in db', updateStatusOpts, err);
          return cb(err);
        }
        
        message.warn('document is not accessible, deleting item', message);
        
        // delete message from queue after callback
        return cb();
      });
    }
      
    return cb(err);
  }

  function getSentenceEntities(sentence, cb) {
    
    // TODO: this was in the original comments (remove duplicate mentions) bu no logic was found
    // normalize mention schemas (workaround until Giovanny fixes his code)
    var entities = sentence.mentions
    
      // fix entities data
      .map(function (mention) {
        
        // this is a workaround, waiting for Giovanney to fix
        if (typeof mention.value !== 'string') mention.value = mention.value.mirna || mention.value.origin || 'aaaaa';
        mention.type = mention.type.toLowerCase(); 
        return mention;
      });
      
    return cb(null, entities);
  }

  return {
      getNewUnprocessedDocumentIDs: getNewUnprocessedDocumentIDs,
      getDocumentSentences: getDocumentSentences,
      getScoring: getScoring,
      getSentenceEntities: getSentenceEntities,
  };
}

module.exports = pipelineLogic;