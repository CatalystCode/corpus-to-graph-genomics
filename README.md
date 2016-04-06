# Document Processing Pipeline
A pipeline that processes documents from a public repository, 
performs entity extraction + scoring on them and outputs the data in the form of a graph.

## Solution Architecture
![Architecture Diagram](docs/architecture.png "Solution Architecture")

The elements in play in this solution are as follows:

| Element           | Description                           |
| ----------------- | ------------------------------------- |
|Public Repository  | External repository that supplies new documents every day
|Trigger Web Job    | Scheduled to run daily and trigger a flow
|Query Web Job      | Queries for new document IDs (latest)
|Parser Web Job     | Divides documents into sentences and entities
|Scoring Web Job    | Scores sentences and relations
|External API       | API (url) that enables entity extraction and scoring
|Graph Data         | Database to store documents, sentences and relations 

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
    * [Slim Deployment](#slim-deployment)
* [License](#license)

# Components
## Web Jobs
There are 3 web jobs in the bundle

| Web Job      | Description                           |
| ------------ | ------------------------------------- |
|__Query__     |Query documents according to date range provided through <br>*Trigger Queue* and insert all unprocessed documents to *New IDs Queue*
|__Parser__    |Processes each document in *New IDs Queue* into <br>sentences and entities and pushes them into *Scoring Queue*
|__Scoring__   |Scores each sentence in *Scoring Queue* via the *Scoring Service*

To get more information on the message api between the web jobs and the queues see [Document Processing Pipeline - Message API](docs/queues.md)

## Logging
The web jobs output their logs into two mediums:
* __nodejs console__ - which is accessible via *Azure Portal > Relevant Web App > Web Jobs > worker > Logs Url*
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
The deployment files are available under azure-deployment folder and use ARM template deployment to perform deploy the environment and continuous deployment.

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
To deploy the template to azure, use the following:
```
azure group create -n resource-group-name -l "West US"
azure group deployment create -f azure-deployment\Templates\azuredeploy.json -e azure-deployment\Templates\parameters.prod.private.json resource-group-name deployment-name
```

To deploy continuous integration run
```
azure group deployment create -f azure-deployment\Templates\azuredeploy.sourcecontrol.json -e azure-deployment\Templates\parameters.prod.private.json resource-group-name deployment-sourcecontrol-name
```
> **Notice 1**: The deployment templates have been divided into two since currently, deploying node continuous deployment with ARM can appear to fail*

> **Notice 2**: Even though continuous deployment may seem to fail, this might be the result of network errors with npm and might actually work*

#### Deployment parameters
* `resource-group-name` - You can use an existing resource group or run `azure group create` to create a new resource group.
* `deployment-name` - The name for the deployment which you can later monitor through and azure cli or the azure portal.

### Slim Deployment
This repository contains two kinds of deployments

| Deployment Name | Description                       |
| --------------- | --------------------------------- |
| Scalable        | Deploys each web job to a separate web app, <br>enabling you to create an app service plan that scales <br> according to CPU % or queue message count.
| Slim            | All web jobs will be deployed to the same web app, which will cost fewer resources.

The **Slim Deployment** (aka "All in one") exists under `azure-deployment\Templates\all-in-one`.
That folder contains separate files for ARM template (base + source control) and parameters.

When deploying using this template, one web job will be created and marked (with environment variable) as `all_in_one`.
This will cause the npm `postinstall` action to create 4 web jobs on the 1 web app.

# License
Document Processing Pipeline is licensed under the [MIT License](LICENSE).
