# Corpus to Graph Genomics Processing Pipeline
This repository is an example for implementing a pipeline for processing medical documents. This repository is a code sample for implementing a pipeline for processing documents of any domain running on the Azure stack. 

Processing steps:
 1. Fetch documents from remote repository - pmc and pubmed databases on NCBI (www.ncbi.nlm.nih.gov).
 2. Split documents to sentences and extract relevant entities (miRNA and genes) using a remote entity extraction service.
 3. Find and score relations between entities in each sentence using a remote scoring API
 4. Store relations and scores into **graph database** to be exposed by **Graph API service**
 
 This repository is an example of using the [Corpus to Graph Pipeline](https://github.com/CatalystCode/corpus-to-graph-pipeline) node module.
 
## Solution Architecture
Components in the solution:

| Component         | Description                           |
| :---------------- | :------------------------------------ |
|Public Repository  | External repository that supplies new documents every day
|Trigger Web Job    | Scheduled to run daily and trigger a flow
|Query Web Job      | Queries for new document IDs (latest)
|Parser Web Job     | Divides documents into sentences and entities
|Scoring Web Job    | Scores sentences and relations
|External API       | API (url) that enables entity extraction and scoring
|Graph Data         | Database to store documents, sentences and relations 

## Architecture Diagram

![Architecture Diagram](https://raw.githubusercontent.com/CatalystCode/corpus-to-graph-pipeline/master/docs/images/architecture.png "Solution Architecture")

# Table of contents
* [Components](#components)
    * [Web Jobs](#web-jobs)
    * [Logging](#logging)
    * [Console](#console---managing-and-monitoring)
    * [Graph API](#graph-api)
* [Testing](#testing)
    * [Prerequisites](#prerequisites)
    * [Running Tests Locally](#running-tests-locally)
    * [Running Tests from Mac\Linux](#running-tests-from-maclinux)
* [Deployment](#deployment)
    * [Running locally](#running-locally)
    * [Local Environment Prerequisites](#local-environment-prerequisites)
    * [Azure Deployment](#azure-deployment)
    * [Deploy with ARM](#deploy-with-arm)
    * [Deployment parameters](#deployment-parameters)
    * [Deployment Types](#deployment-types)
* [Code Challenges](#code-challenges)
    * [Deploying Node.js as a Web Job](#deploying-nodejs-as-a-web-job)
    * [Seamless Execution Across Execution Modes](#seamless-execution-across-execution-modes)
* [License](#license)

# Components
## Web Jobs
There are 3 web jobs in the bundle

| Web Job      | Description                           |
| ------------ | ------------------------------------- |
|__Trigger__   |A schedules web job that triggers a daily check for new document Ids
|__Query__     |Query documents according to date range provided through <br>*Trigger Queue* and insert all unprocessed documents to *New IDs Queue*
|__Parser__    |Processes each document in *New IDs Queue* into <br>sentences and entities and pushes them into *Scoring Queue*
|__Scoring__   |Scores each sentence in *Scoring Queue* via the *Scoring Service*

To get more information on the message api between the web jobs and the queues see [Corpus to Graph Pipeline - Message API](https://raw.githubusercontent.com/CatalystCode/corpus-to-graph-pipeline/master/docs/queues.md)

## Logging
The web jobs output their logs into two mediums:
* __nodejs console__ - Using the nodejs common console.log\console.info etc...
* __console web app__ - see [Console](#console---managing-and-monitoring)

## Console - Managing and Monitoring
The **Console Application** web app is deployed as part of the solution. For more information see [Console - Managing and Monitoring the Pipeline](docs/console.md)

## Graph API
Used to expose the output of the pipeline.
Mainly designed to be used by the loom tool to get the entities and the relations.

# Testing
## Prerequisites
To run the tests locally, create a `setenv.test.cmd` file at the root of your repository. You can copy it from `env.template.cmd` as a template.

For local run parameters see [Local Run Parameters](docs/local-params.md)

## Running Tests Locally
Initiate tests by running:
```
npm install
npm test
```

## Running Tests from Mac\Linux
To run unit testing from mac or linux, you need nothing special.

Integration tests have a setup part that runs the schema.sql on the configured sql database.
To run integration tests from a mac\linux machine you either need to have `sqlcmd` installed locally or 
run :
* [deployment/sql/dropschema.sql](deployment/sql/dropschema.sql)
* [deployment/sql/schema.sql](deployment/sql/schema.sql)
* [deployment/sql/testsetup.sql](deployment/sql/testsetup.sql)

(in that order) on your sql database manually and then run the integration tests. 

# Deployment
The deployment files are available under azure-deployment folder.
It uses ARM template to deploy the environment and connect it to git with continuous deployment.

## Running Locally
Create a `setenv.private.cmd` file at the root of your repository. You can copy it from `env.template.cmd` as a template.

For local run parameters see [Local Run Parameters](docs/local-params.md)

### Local Environment Prerequisites
* Sql Server, Database, login name and password (schema is available in [Schema.sql](deployment/sql/schema.sql))
* Azure storage account name and key for queues
* Azure storage account name and key for logging (can use the same one as for queues)
* Service URLs for: Document processing, Scoring
* [Enable Google Authentication](docs/google-auth.md)

## Azure Deployment
Create a `azure-deployment/Templates/azuredeploy.parameters.private.json` file with your configuration and passwords. 
You can use `azure-deployment/Templates/azuredeploy.parameters.json` file as a reference.

### Prerequisites
* An active azure subscription
* Service URLs for: Document processing, Scoring
* [Enable Google Authentication](docs/google-auth.md) on the **console web app** url
* [Set Up Git](https://help.github.com/articles/set-up-git/)

To edit the deployment parameters see [Azure Deployment Parameters](docs/azure-params.md)
**TODO - There should be no prerequisites to the project**
**1) Remove project dependencies**
**2) Enable user/password authentication to prevent dependency on google authentication**

### Deploy with ARM
Install <a href="https://azure.microsoft.com/en-us/documentation/articles/xplat-cli-install/" target="_blank">azure-cli</a> and change mode to ARM
```
npm install -g azure-cli
azure config mode arm
```
List all subscriptions and see the currently set subscription.<br>
In case you need to change the subscription, use `azure account set`.
```
azure account list
azure account show
azure account set c37fee37-d7f6-45bc-a4f2-852780bda058
```
To deploy the template to azure, use the following (You can also use azure-deployment\Templates\scalable\deploy.cmd):
```cli
cd azure-deployment\Templates\scalable\
azure group create -n resource-group-name -l "West US"
azure group deployment create -f azuredeploy.json -e parameters.private.json resource-group-name deployment-name
```

To deploy continuous integration run
```
azure group deployment create -f azuredeploy.sourcecontrol.json -e parameters.private.json resource-group-name deployment-sourcecontrol-name
```
> **Notice 1**: The deployment templates have been divided into two since currently, deploying node continuous deployment with ARM can seem to fail*

> **Notice 2**: Even though continuous deployment may seem to fail, this might be the result of network errors with npm and might actually work*

#### Deployment parameters
* `resource-group-name` - You can use an existing resource group or run `azure group create` to create a new resource group.
* `deployment-name` - The name for the deployment which you can later monitor through and azure cli or the azure portal.

### Deployment Types
This repository contains two kinds of deployments

#### Scalable Deployment
![Scalable Deployment](/azure-deployment/Images/resource-architecture.png "Scalable Deployment")

#### Slim Deployment
![Slim Deployment](/azure-deployment/Images/resource-architecture-aio.png "Slim Deployment")

| Deployment Name | Description                       |
| --------------- | --------------------------------- |
| Scalable        | Deploys each web job to a separate web app, <br>enabling the creation of an app service plan that scales <br> according to CPU % or queue message count.
| Slim            | All web jobs will be deployed to the same web app, which will cost fewer resources.

The **Slim Deployment** (aka "All in one") exists under `azure-deployment\Templates\all-in-one`.
That folder contains separate files for ARM template (base + source control) and parameters.

When deploying using this template, one web job will be created and marked (with environment variable) as `all_in_one`.
This will cause the npm `postinstall` action to create 4 web jobs on the 1 web app.

# Code Challenges

## Deploying Node.js as a Web Job
In order to automatically deploy our application via **Continuous Deployment** we need to take the following into consideration:

1. **Continuous Deployment** makes a copy of your repository in `D:\home\site\wwwroot`
2. **Web Jobs** are automatically created by placement under `D:\home\site\wwwroot\app_data\jobs\<type>\<name>`
3. `<type>` is either `continuous` for always running jobs, or `triggered` for manual/scheduled **Web Job**
4. `<name>` is the name you will see when viewing the **Web Job** in the **App Service**
5. For **scheduled** web jobs, you simply need to add a `settings.job` file ([**CRON** format](http://www.nncron.ru/help/EN/working/cron-format.htm)) in that folder as well.

As such, we use the `npm postinstall` script to determine the **Web Job** type and the specific service to run in order to copy/override the `app.js` in the relevant web job folder.

> Currently [Sep 18th 2016] there is an issue deploying **source control** (**continuous deployment**) with **application settings** to **App Services**. The deployment works, requires to tun the deployment command for a second time to ensure **application settings**. It is handled by an issue on git-hub: [azure-xplat-cli issue #2618](https://github.com/Azure/azure-xplat-cli/issues/2618)

## Seamless Execution Across Execution Modes
The first step in solving the **Continuous Deployment** problem - All services should be connected to the same repository, but each running different code.

For that `app.js` is used as the entry point for all **Web Jobs** and environment variables are used to indicate which service should currently run. This looks something like that:

```js
var webJobName = process.env.PIPELINE_ROLE;
...
var runner = new continuousRunner(webJobName, config);
runner.start();
```

Environment variables are used to provide service specific settings, such as Azure storage settings, Sql server configuration, external endpoints, etc. They are also used to define which service should run on which machine (ie. PIPELINE_ROLE).

In each of the following scenarios we set the environment variable in different methods:

##### Development - Process Execution
Each "web job" has a dedicated `run.<service>.cmd` file, which sets the relevant environment variables.
The `run.cmd` file executes all cmd files in parallel.

##### Testing - Background Processes
The testing framework starts all web jobs before executing the tests.
It uses log history to check whether specific conditions are met to validate tests' results.

The test runs each web job as a separate process as follows:

```js
var worker = exec('set PIPELINE_ROLE=' + webJobName + '&& node ' + runAppJSPath);
```

# License
Document Processing Pipeline is licensed under the [MIT License](LICENSE).
