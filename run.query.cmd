SET setenvpath=%1
SET dontinstallnpm=%2

IF [%setenvpath%]==[] SET setenvpath=setenv.private.cmd

echo calling %setenvpath%
call %setenvpath%
set PIPELINE_ROLE=query

IF [%dontinstallnpm%]==[] call npm install
call node webjob\continuous\app.js
