# Local Run Parameters
[This document is part of [Document Processing Pipeline](../README.md)]

* `DB_SERVER`- Sql server name
* `DB_NAME`- Sql database name
* `DB_USER`- Sql user name
* `DB_PASSWORD` - Sql login password
* `DB_BATCH_SIZE` - The number of records to process as a batch. 
Used when expecting a large set of data with streaming to avoid running out of memory. 
Currently using this in the rescore and reprocess scenarios where the number of records potentially gets to millions.
* `STORAGE_ACCOUNT`- Storage account name (only letters and digits)
* `STORAGE_KEY` - Storage account secret key
* `LOG_STORAGE_ACCOUNT`- Logs storage account name (only letters and digits)
* `LOG_STORAGE_KEY` - Logs storage account secret key
* `QUEUE_TRIGGER_QUERY`- Name of the queue for triggering new workflows
* `QUEUE_NEW_IDS`- Name of the queue for queuing new documents to be processed
* `QUEUE_SCORING`- Name of the queue for queuing sentences for scoring
* `QUEUE_VISIBILITY_TIMEOUT_SECS` - Seconds a processed message is hidden in queue
* `QUEUE_CHECK_FREQUENCY_MSECS` - Timeout between web job itterations
* `LOG_LEVEL` - Minimum log level to monitor (based on console logging values)
* `CONSOLE_LOG_LEVEL` Minimum log level to output to the console
* `SERVICE_DOC_URL` - Url for the service which processes documents into sentences and entities
* `SCORING_SERVICES` - Url dictionary for scoring services - `SVC1::http://url1;SVC2::http://url2`
* `GOOGLE_CLIENT_ID`- your google client Id
* `GOOGLE_CLIENT_SECRET`- your google client secret
* `GOOGLE_CALLBACK_URL` - Url for the google client callback
* `GOOGLE_ADMIN_ACCOUNT`- a Google email address which will be the first admin user to use the console
* `WORKERS` - How many active processed each web job should have
* `HTTP_TIMEOUT_MSECS` - Http requests timeout
* `USE_ANODE_LOGGING` - "true" or "false". Indicates whether to use the anode logging infrastructure or not.

**TODO: maybe remove this file** 