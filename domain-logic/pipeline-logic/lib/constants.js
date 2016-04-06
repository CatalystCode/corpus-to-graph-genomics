var constants = {
  sources: {
    pmc: 2,
    pubmed: 1
  },
  sourcesById: {}, // Populated automatically
  dbs: {
    pmc: { name: 'pmc', source: 'pmc', active: true },
    pubmed: { name: 'pubmed', source: 'pubmed', active: false}
  },
  service: {
    host: 'http://eutils.ncbi.nlm.nih.gov/',
    path: 'entrez/eutils/',
    services: {
      search: 'esearch.fcgi',
      fetch: 'efetch.fcgi'
    }
  },
  etypes: {
    edat: 'edat'
  },
  conceptTypes: {
    GENE: 1,
    MIRNA: 2,
    SPECIES: 3,
    CHEMICAL: 4,
    OTHER: 5
  },
  conceptTypesById: {} // Populated automatically
}

for (var key in constants.conceptTypes) {
  constants.conceptTypesById[constants.conceptTypes[key]] = key;
}

for (var sourceName in constants.sources) {
  constants.sourcesById[constants.sources[sourceName]] = sourceName;
}

module.exports = constants;