"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var parser_1 = require("./utils/parser");
var helpcli_1 = require("./utils/helpcli");
var fs = require("fs");
var logger_1 = require("./utils/logger");
var template_printer_1 = require("./utils/template-printer");
var node_fetch_1 = require("node-fetch");
var Generator = /** @class */ (function () {
    function Generator(config) {
        if (config === void 0) { config = null; }
        this.swagger = null;
        this.parser = new parser_1.Parser();
        this.helper = new helpcli_1.HelpCLI();
        this._logger = new logger_1.Logger();
        this._printer = new template_printer_1.TemplatePrinter();
        if (config) {
            this.config = config;
        }
        else {
            this.config = this.helper.parseArgs();
        }
        if (this.config.help) {
            this.helper.printHelp();
        }
        else {
            if (this.config.config !== "" && this.config.out !== "") {
                this.start();
            }
            else {
                this._logger.err("Params not set, see help and try again:");
                this.helper.printHelp();
            }
        }
    }
    Generator.prototype.start = function () {
        var _this = this;
        this.getConfig(this.config.config).then(function (res) {
            _this._logger.info("<Parsing Processed...>");
            _this._logger.ok(JSON.stringify(res));
            _this.parser.parse(res).then(function (res) {
                var _a, _b, _c, _d;
                _this._logger.ok("[ SUCCESS ]: Swagger JSON Parsed Successfull!");
                _this._logger.info("<Files Saving>");
                var extend = null;
                try {
                    extend = JSON.parse(fs.readFileSync("./sw2ngx-extend.json", "utf-8"));
                }
                catch (e) {
                    _this._logger.info("Not have extends");
                }
                if (extend) {
                    if (extend.enums) {
                        (_a = res[0]).push.apply(_a, extend.enums);
                    }
                    if (extend.models) {
                        (_b = res[1]).push.apply(_b, extend.models);
                    }
                    if (extend.services) {
                        for (var key in extend.services) {
                            if (extend.services[key]) {
                                if (res[2][key]) {
                                    if (extend.services[key].imports) {
                                        (_c = res[2][key].imports).push.apply(_c, extend.services[key].imports);
                                    }
                                    if (extend.services[key].methods) {
                                        (_d = res[2][key].methods).push.apply(_d, extend.services[key].methods);
                                    }
                                }
                                else {
                                    res[2][key] = extend.services[key];
                                }
                            }
                        }
                    }
                }
                // fs.writeFileSync(path.resolve('./result.json'), JSON.stringify({
                //     enums: res[0],
                //     models: res[1],
                //     services: res[2]
                // }));
                _this._printer.print(res[0], res[1], res[2], _this.config.out).then(function () {
                    _this._logger.ok("[ SUCCESS ]: Generation API Module Successfull!");
                }, function (reject) {
                    console.log("end here");
                    _this._logger.err(JSON.stringify(reject));
                });
            }, function (err) {
                _this._logger.err(JSON.stringify(err));
            });
            // this._logger.info('<Create Swagger Map Object>');
        }, function (err) {
            _this._logger.err(JSON.stringify(err));
        });
    };
    Generator.prototype.getConfig = function (conf) {
        var _this = this;
        var promise = new Promise(function (resolve, reject) {
            if (/http(s?):\/\/\S/gi.test(conf)) {
                node_fetch_1.default(conf)
                    .then(function (res) {
                    resolve(res.json());
                })
                    .catch(function (err) {
                    _this._logger.err(err);
                    reject(err);
                });
            }
            else {
                _this.swagger = JSON.parse(fs.readFileSync(conf, "utf-8"));
                resolve(_this.swagger);
            }
        });
        return promise;
    };
    return Generator;
}());
exports.default = Generator;
//# sourceMappingURL=sw2ngx.js.map