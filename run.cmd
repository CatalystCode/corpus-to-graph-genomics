SET setenvpath=%1

IF [%setenvpath%]==[] SET setenvpath=setenv.private.cmd
echo set env path: %setenvpath%
call npm install

start "" run.query.cmd %setenvpath% "false"
start "" run.parser.cmd %setenvpath% "false"
start "" run.scoring.cmd %setenvpath% "false"
