@echo off

IF [%1]==[/?] GOTO :help

echo %* |find "/?" > nul
IF errorlevel 1 GOTO :main

:help
ECHO Run this command like this:
ECHO deploy.cmd [new resource group name] [parameters file]
ECHO -------------------------------------------------------
ECHO This command will create a new resource group in azure, 
ECHO deploy the [azuredeploy.json]+[azuredeploy.sourcecontrol.json] 
ECHO ARM templates and connect the web apps to git
ECHO.
ECHO Example:
ECHO deploy.cmd genomix_pipeline_staging parameters.staging.private.json
GOTO :end

:main

SET resource_group_name=%1
IF [%resource_group_name%]==[] SET /p resource_group_name="Enter a resource group name:"
IF [%resource_group_name%]==[] echo "No resource group name was provided" && exit /b

SET parameters_file=%2
IF [%parameters_file%]==[] SET /p parameters_file="Enter parameters file:"
IF [%parameters_file%]==[] echo "No parameters file was provided" && exit /b

SET deployment_name=deployment-%date:~7,2%%date:~4,2%%date:~10,4%

echo Creating resource group %resource_group_name% in West US

@echo on
call azure group create -n %resource_group_name% -l "West US"

call azure group deployment create -f azuredeploy.json -e %parameters_file% %resource_group_name% %deployment_name%-base
timeout 20

call azure group deployment create -f azuredeploy.sourcecontrol.json -e %parameters_file% %resource_group_name% %deployment_name%-git

:end