const logger = (function(){
    const _self = this;
    const help_colors = {
        reset: "\x1b[0m",
        bright: "\x1b[1m",
        dim: "\x1b[2m",
        underscore: "\x1b[4m",
        blink: "\x1b[5m",
        reverse: "\x1b[7m",
        hidden: "\x1b[8m"
    }
    const text = {
        black: "\x1b[30m",
        red: "\x1b[31m",
        green: "\x1b[32m",
        yellow: "\x1b[33m",
        blue: "\x1b[34m",
        magenta: "\x1b[35m",
        cyan: "\x1b[36m",
        white: "\x1b[37m",
    };
    const background = {
        black: "\x1b[40m",
        red: "\x1b[41m",
        green: "\x1b[42m",
        yellow: "\x1b[43m",
        blue: "\x1b[44m",
        magenta: "\x1b[45m",
        cyan: "\x1b[46m",
        white: "\x1b[47m"
    }
    _self.reset = function () {
        process.stdout.write(help_colors.reset);
        return _self;
    }
    _self.bg = function (color) {
        process.stdout.write(background[color]);
        return _self;

    }
    _self.fg = function (cl) {
        process.stdout.write(text[cl]);
        return _self;
    }
    _self.write = function (string) {
        process.stdout.write(string);
        return _self;
    }
    _self.writeln = function (string) {
        process.stdout.write(string);
        process.stdout.write('\r\n');
        return _self;
    }
    return _self;
})();
module.exports = logger;