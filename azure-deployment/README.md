# The Problem
The main challenge with converting a large document repository or **corpus** into a graph of entities and relations, is determining how to reduce the conversion process into a series of encapsulated tasks, taking into account that some tasks require more resources than others. 
For example, splitting a document into sentences is a light-weight operation compared to extracting entities from all sentences in that document.

As part of building a pipeline we opted for a solution that was simple, manageable and testable.
The solution's deployment model needed to be scalable and expose APIs for external consumption.

# Overview of Solution
The pipeline can run on any platform and in any hosting environment. 
We used Node.js and non-native node-modules so that there are no platform-dependant components.

The pipeline consists of the following stages: 
Daily check of new documents from public repository ==> Turn document into sentences and each sentence into entities ==> Extract and score relations ==> store relation and scoring to the graph database.

Both scoring and entity extraction logic are implemented through exposing a separate interface. 
In our implementation, that interface consumes a **REST API** implemented outside of this repository.

![Pipeline architecture][architecture]

## ARM Deployment
We used **ARM templates** for deploying the solution since it can be deployed using the platform-independent **azure cli** command line tool. 
The Arm templates can also be deployed directly from Github:
[Scalable Template][scalable-template]; [All-in-one Template][all-in-one-template].

We created two templates for the solution. 
The **scalable** ARM template is for deployment to production which enables configuring the **web jobs** to scale by the incoming queue size. 
Since the scalable template is taxing on resources, we created another **all in one** template that deploys all **web jobs** into the same **web app** for testing and integration.

Additionally, all the resources required for deployment are configurable and connectible via the ARM template itself.

These are the two templates and the contained resources:

## ARM Deployment - Scalable Architecture
![Scalable ARM template][scalable-architecture]

## ARM Deployment - All-in-one Architecture
![All-in-one ARM template][all-in-one-architecture]

## Azure Application Services - Web Jobs
We chose to use **Azure Application Services** since the **Web Jobs** features provides for two main aspects:

* Queue based scalability
* Continuous deployment

## Deploying Node.js as a Web Job
In order to automatically deploy our application via **Continuous Deployment** we need to take the following into consideration:

1. **Continuous Deployment** makes a copy of your repository in `D:\home\site\wwwroot`
2. **Web Jobs** are automatically created by placement under `D:\home\site\wwwroot\app_data\jobs\<type>\<name>`
3. <type> is either `continuous` for always running jobs, or `triggered` for manual/scheduled **Web Job**
4. <name> is the name you will see when viewing the **Web Job** in the **App Service**
5. For **scheduled** web jobs, you simply need to add a `settings.job` file ([**CRON** format][cron-format]) in that folder as well.

As such, we use the `npm postinstall` script to determine the **Web Job** type and the specific service to run in order to copy/override the `app.js` in the relevant web job folder.

> Currently there is an issue deploying **node js** repository to **App Services**. The deployment works, but the resulting status is **failed with Conflict**. It is handled by an issue on git-hub: [azure-xplat-cli issue #2618](https://github.com/Azure/azure-xplat-cli/issues/2618)

## Seamless Execution Across Execution Modes
The first step in solving the **Continuous Deployment** problem - All services should be connected to the same repository, but each running different code.
For that we used `app.js` as the entry point for all **Web Jobs** and environment variables to tell the current process which service should currently run. This looks something like this:

```js
var webJobName = process.env.PIPELINE_ROLE;
...
var runner = new continuousRunner(webJobName, config);
runner.start();
```

Environment variables are used to provide service specific settings, such as Azure storage settings, Sql server configuration, external endpoints, etc. 
Environment variables are also used to define which service should run on which machine (ie. PIPELINE_ROLE).

In each of the following scenarios we set the environment variable in different methods:
##### Development - Process Execution
Each "web job" has a dedicated `run.<service>.cmd` file, which sets the relevant environment variables for that web job to run. 
There is also a `run.cmd` file that executes all cmd files simultaneously.

##### Testing - Background Processes
The testing framework starts all web jobs simultaneously before executing the tests. 
It uses log history to check whether specific conditions are met to validate tests' results.

The test runs each web job as a separate process as follows:

```js
var worker = exec('set PIPELINE_ROLE=' + webJobName + '&& node ' + runAppJSPath);
```

## Deploying to Azure using ARM
To deploy the solution to Azure we use **ARM templates**, which enable us to create different resources (like **Azure Storage** and **SQL Server**) as part of the same deployment and connect them together using environment variables.

Using **ARM script** the user can deploy the solution from any client using scripts under `azure-deployment\templates` directory or by running:

```
azure group create -n <resource_group_name> -l "West US"
azure group deployment create -f azuredeploy.all-in-one.json -e <parameters_file> <resource_group_name> <deployment_name>
```

# Opportunities for Reuse
Projects which require "corpus to graph" pipelines.
 
This case study is an example for leveraging corpus-to-graph-pipeline node module.
It can be used wherever there's a need to process large amount of documents and expose an entity relations graph.

Developers can leverage this repository in the fields of medicine, knowledge management and genomics (similar to this project). 

# Repositories
[corpus-to-graph-pipeline][corpus-to-graph-pipeline]: Generic module for corpus to graph pipeline.

[corpus-to-graph-genomics][corpus-to-graph-genomics]: An example on how to use _corpus-to-graph-pipeline_ in the world of genomics.

[//]: # (Links section)
    
   [azure-cli]: <https://azure.microsoft.com/en-us/documentation/articles/xplat-cli-install/>
    
   [corpus-to-graph-pipeline]: <https://github.com/CatalystCode/corpus-to-graph-pipeline>
   [corpus-to-graph-genomics]: <https://github.com/CatalystCode/corpus-to-graph-genomics>
    
   [cron-format]: <http://www.nncron.ru/help/EN/working/cron-format.htm>
   
   [scalable-architecture]: <Images/resource-architecture.png>
   [all-in-one-architecture]: <Images/resource-architecture-aio.png>
   
   [scalable-template]: <Templates/scalable>
   [all-in-one-template]: <Templates/all-in-one>
   
   [architecture]: <https://raw.githubusercontent.com/CatalystCode/corpus-to-graph-pipeline/readme-updates/docs/images/architecture.png>