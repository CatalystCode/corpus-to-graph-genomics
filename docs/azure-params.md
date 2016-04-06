# Azure Deployment Parameters
[This document is part of [Document Processing Pipeline](../README.md)]

* `DB_SERVER`- Sql server name
* `DB_NAME`- Sql database name
* `DB_USER`- Sql user name
* `DB_PASSWORD` - Sql login password
* `STORAGE_ACCOUNT`- Storage account name (only letters and digits)
* `LOG_STORAGE_ACCOUNT`- Logs storage account name (only letters and digits)
* `QUEUE_TRIGGER_QUERY`- Name of the queue for triggering new workflows
* `QUEUE_NEW_IDS`- Name of the queue for queuing new documents to be processed
* `QUEUE_SCORING`- Name of the queue for queuing sentences for scoring
* `LOG_LEVEL` - Minimum log level to monitor (based on console logging values)
* `SERVICE_DOC_URL` - Url for the service which processes documents into sentences and entities
* `SCORING_SERVICES` - Url dictionary for scoring service - `SVC1::http://url1;SVC2::http://url2`
* `SUPPORTED_ENTITIES` - Supported entities to be extracted from sentences - `gene;mirna`
* `queryIDSiteName` - The name for the query web job name
* `docParserSiteName` - The name for the parser web job name
* `scoringSiteName` - The name for the scoring web job name
* `graphWebsiteName` - The name for the graph web site name
* `consoleWebsiteName` - The name for the console web site name
* `hostingPlanName` - Name for the hosting plan for the services
* `siteLocation` - Geographic site location
* `repoURL` - Github repository url for continuous integration
* `branch` - Github repository branch name for continuous integration
* `GOOGLE_CLIENT_ID`- your google client Id
* `GOOGLE_CLIENT_SECRET`- your google client secret
* `GOOGLE_ADMIN_ACCOUNT`- your google email address which will be the first admin user to use the console
* [optional]`sku` - Scaling unit for the hosting plan { Free [default], Shared, Basic, Standard }
* [optional]`workerSize` - Number of processes to run on each machine | default - 0 - number of processes will be according to the amount of cores.
* [optional]`databaseCollation` - default is `SQL_Latin1_General_CP1_CI_AS`
* [optional]`databaseEdition` - { Basic [default], Standard, Premium }
* [optional]`databaseRequestedServiceObjectiveName` - Describes the performance level for Edition { Basic [default], S0, S1, S2, P1, P2, P3 }
* [optional]`pipelineStorageType` - { Standard_LRS [default], Standard_ZRS, Standard_GRS, Standard_RAGRS, Premium_LRS }

__TODO: change all deployment parameters to CAML case.__
