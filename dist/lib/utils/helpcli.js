"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var logger_1 = require("./logger");
var params_1 = require("../interfaces/params");
var HelpCLI = /** @class */ (function () {
    function HelpCLI() {
        this.logger = new logger_1.Logger();
    }
    HelpCLI.prototype.parseArgs = function () {
        var params = {
            config: '',
            out: '',
            help: false
        };
        var args = process.argv;
        for (var i = 0; i < args.length; i++) {
            for (var _i = 0, GeneratorParams_1 = params_1.GeneratorParams; _i < GeneratorParams_1.length; _i++) {
                var param = GeneratorParams_1[_i];
                if (param.keys.indexOf(args[i]) !== -1) {
                    if (param.noValue) {
                        params[param.name] = true;
                        break;
                    }
                    else {
                        params[param.name] = args[i + 1];
                        i++;
                        break;
                    }
                }
            }
        }
        return params;
    };
    HelpCLI.prototype.printHelp = function () {
        this.logger
            .fg('green')
            .writeln('')
            .write('[HELP]')
            .write(':')
            .writeln('')
            .reset()
            .writeln('');
        for (var _i = 0, GeneratorParams_2 = params_1.GeneratorParams; _i < GeneratorParams_2.length; _i++) {
            var key = GeneratorParams_2[_i];
            var line = "     " + key.name + "          ";
            line = line.substr(0, 15);
            var args = new Array(40).fill(' ');
            var i = 1;
            for (var _a = 0, _b = key.keys; _a < _b.length; _a++) {
                var arg = _b[_a];
                args[i + 2] = arg;
                i = i + 2;
            }
            this.logger.write(line)
                .fg('yellow');
            line = args.join('');
            line = line.substr(0, 20);
            this.logger.write(line)
                .reset();
            line = '     ' + key.description;
            this.logger.write(line);
            this.logger.writeln('');
        }
    };
    return HelpCLI;
}());
exports.HelpCLI = HelpCLI;
//# sourceMappingURL=helpcli.js.map