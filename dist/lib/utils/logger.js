"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.COLORS_HLP = {
    reset: "\x1b[0m",
    bright: "\x1b[1m",
    dim: "\x1b[2m",
    underscore: "\x1b[4m",
    blink: "\x1b[5m",
    reverse: "\x1b[7m",
    hidden: "\x1b[8m"
};
exports.COLORS_TXT = {
    black: "\x1b[30m",
    red: "\x1b[31m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    magenta: "\x1b[35m",
    cyan: "\x1b[36m",
    white: "\x1b[37m"
};
exports.COLORS_BG = {
    black: "\x1b[40m",
    red: "\x1b[41m",
    green: "\x1b[42m",
    yellow: "\x1b[43m",
    blue: "\x1b[44m",
    magenta: "\x1b[45m",
    cyan: "\x1b[46m",
    white: "\x1b[47m"
};
var Logger = /** @class */ (function () {
    function Logger() {
    }
    Logger.prototype.reset = function () {
        process.stdout.write(exports.COLORS_HLP.reset);
        return this;
    };
    Logger.prototype.bg = function (color) {
        process.stdout.write(exports.COLORS_BG[color]);
        return this;
    };
    Logger.prototype.fg = function (color) {
        process.stdout.write(exports.COLORS_TXT[color]);
        return this;
    };
    Logger.prototype.write = function (line) {
        process.stdout.write(line);
        return this;
    };
    Logger.prototype.writeln = function (line) {
        process.stdout.write(line);
        process.stdout.write('\r\n');
        return this;
    };
    Logger.prototype.info = function (message) {
        this.reset().writeln('').fg('blue').writeln(message).reset();
    };
    Logger.prototype.err = function (message) {
        this.reset().writeln('').fg('red').writeln(message).reset();
    };
    Logger.prototype.ok = function (message) {
        this.reset().writeln('').fg('green').writeln(message).reset();
    };
    return Logger;
}());
exports.Logger = Logger;
//# sourceMappingURL=logger.js.map