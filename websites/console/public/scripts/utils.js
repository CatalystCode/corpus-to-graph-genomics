/**
 * Created by JetBrains WebStorm.
 * User: amitu
 * Date: 2/9/12
 * Time: 5:11 PM
 * To change this template use File | Settings | File Templates.
 */

//======================================================================================================================================================================================
// Indirection to the console.Xxx that allows setting levels per context.
//======================================================================================================================================================================================
function Console(context) {
  this.context = context;
}

if (!window.console) console = {};
console.log = console.log || function () { };
console.warn = console.warn || function () { };
console.error = console.error || function () { };
console.info = console.info || function () { };

Console.ERROR_LEVEL = 3;
Console.WARN_LEVEL = 2;
Console.INFO_LEVEL = 1;
Console.NO_OUTPUT = 0;
Console._levels = {};
Console.setLevel = function (context, level) {
  console.info('Log level for', context, 'is', level)
  Console._levels[context] = level;
};

Console.prototype = {
  info: function() { this._log(Console.INFO_LEVEL, console.info, arguments); },
  warn: function() { this._log(Console.WARN_LEVEL, console.warn, arguments); },
  error: function() { this._log(Console.ERROR_LEVEL, console.error, arguments); },

  _log: function(funcLevel, method, args) {
    var level = Console._levels[this.context];
    if (funcLevel < level) return;

    var consoleArgs = []
    consoleArgs.push(this.context);
    consoleArgs.push('>>>');

    for (var i in args) {
      consoleArgs.push(args[i])
    }

        method.apply(console, consoleArgs);
  }
};
