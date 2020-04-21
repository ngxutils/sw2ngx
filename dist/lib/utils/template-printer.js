"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var logger_1 = require("./logger");
var fs = require("fs");
var path = require("path");
var change_case_1 = require("change-case");
var ejs = require("ejs");
var TemplatePrinter = /** @class */ (function () {
    function TemplatePrinter() {
        this.out = '';
        this._printedServices = [];
        this._logger = new logger_1.Logger();
        this._templateFolder = '';
        this._stdTemplateFolder = path.resolve(__dirname, '../../templates/default/');
        this._singleFileTemplateFolrder = path.resolve(__dirname, './templates/default/');
    }
    ;
    ;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    TemplatePrinter.prototype.createFolders = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            try {
                fs.mkdirSync(path.resolve(_this.out));
                fs.mkdirSync(path.resolve(_this.out + '/models'));
                fs.mkdirSync(path.resolve(_this.out + '/models/enums'));
                fs.mkdirSync(path.resolve(_this.out + '/services'));
                resolve();
                return;
            }
            catch (error) {
                reject();
            }
        });
    };
    TemplatePrinter.prototype.print = function (enums, models, services, out, templateFolder) {
        var _this = this;
        this.out = out;
        this._templateFolder = templateFolder ? templateFolder : '';
        return new Promise(function (resolve, reject) {
            _this.createFolders()
                .then(function () {
                for (var _i = 0, enums_1 = enums; _i < enums_1.length; _i++) {
                    var item = enums_1[_i];
                    _this.printEnum(item);
                }
                _this.printEnumIndex(enums);
                for (var _a = 0, models_1 = models; _a < models_1.length; _a++) {
                    var item = models_1[_a];
                    _this.printModel(item);
                }
                _this.printModelIndex(models);
                for (var name_1 in services) {
                    if (services[name_1] && services[name_1].methods.length > 0) {
                        _this.printService(services[name_1], name_1);
                    }
                }
                _this.printServiceIndex();
                _this.printModule();
                _this.printIndex();
                resolve();
            })
                .catch(function (err) { return reject(err); });
        });
    };
    TemplatePrinter.prototype.printEnum = function (value) {
        var _this = this;
        var template = this.getTemplate('enum');
        if (template === '') {
            return;
        }
        ejs.renderFile(template, {
            value: value
        }, {}, function (err, str) {
            if (err) {
                _this._logger.err("[ ERROR ] EJS print error: " + err);
                return;
            }
            try {
                fs.writeFileSync(path.resolve(_this.out + '/models/enums/' + change_case_1.paramCase(value.name) + '.enum.ts'), str);
            }
            catch (e) {
                _this._logger.err('[ ERROR ] file: ' +
                    _this.out +
                    '/models/enums/' +
                    change_case_1.paramCase(value.name) +
                    '.enum.ts');
            }
        });
    };
    TemplatePrinter.prototype.printModel = function (model) {
        var _this = this;
        var template = this.getTemplate('model');
        if (template === '') {
            return;
        }
        ejs.renderFile(template, {
            model: model
        }, {}, function (err, str) {
            if (err) {
                _this._logger.err("[ ERROR ] EJS print error: " + err);
                return;
            }
            fs.writeFile(path.resolve(_this.out +
                '/models/' +
                change_case_1.paramCase(model.name).replace(/^i-/gi, '') +
                '.model.ts'), str, function (err) {
                if (err) {
                    _this._logger.err('[ ERROR ] file: ' +
                        _this.out +
                        '/models/' +
                        change_case_1.paramCase(model.name).replace(/^i-/gi, '') +
                        '.model.ts');
                    return;
                }
                _this._logger.ok('[ OK    ] file: ' +
                    _this.out +
                    '/models/' +
                    change_case_1.paramCase(model.name).replace(/^i-/gi, '') +
                    '.model.ts');
            });
        });
    };
    TemplatePrinter.prototype.printService = function (service, name) {
        var _this = this;
        var template = this.getTemplate('service');
        if (template === '') {
            return;
        }
        ejs.renderFile(template, {
            service: service,
            fnpascalCase: change_case_1.pascalCase,
            name: name
        }, {}, function (err, str) {
            if (err) {
                _this._logger.err("[ ERROR ] EJS print error: " + err);
                return;
            }
            _this._printedServices.push(change_case_1.pascalCase(name));
            fs.writeFile(path.resolve(_this.out + '/services/' + change_case_1.paramCase(name) + '.service.ts'), str, function (err) {
                if (err) {
                    _this._logger.err('[ ERROR ] file: ' +
                        _this.out +
                        '/services/' +
                        change_case_1.paramCase(name) +
                        '.service.ts');
                    return;
                }
                _this._logger.ok('[ OK    ] file: ' +
                    _this.out +
                    '/services/' +
                    change_case_1.paramCase(name) +
                    '.service.ts');
            });
        });
    };
    TemplatePrinter.prototype.printModule = function () {
        var _this = this;
        var template = this.getTemplate('module');
        if (template === '') {
            return;
        }
        ejs.renderFile(template, {
            servicesList: this._printedServices.map(function (x) { return x + 'APIService'; })
        }, {}, function (err, str) {
            if (err) {
                _this._logger.err("[ ERROR ] EJS print MODULE error: " + err);
                return;
            }
            fs.writeFile(path.resolve(_this.out + '/api.module.ts'), str, function (err) {
                if (err) {
                    _this._logger.err('[ ERROR ] file: ' + _this.out + '/api.module.ts');
                    return;
                }
                _this._logger.ok('[ OK    ] file: ' + _this.out + '/api.module.ts');
            });
        });
    };
    TemplatePrinter.prototype.printIndex = function () {
        var imports = "export * from './services';\nexport * from './models';\nexport { APIModule } from './api.module';\n";
        try {
            fs.writeFileSync(path.resolve(this.out + '/index.ts'), imports);
        }
        catch (e) {
            this._logger.err('[ ERROR ] file: ' + this.out + '/index.ts');
        }
    };
    TemplatePrinter.prototype.printServiceIndex = function () {
        var imports = [];
        for (var _i = 0, _a = this._printedServices; _i < _a.length; _i++) {
            var item = _a[_i];
            imports.push("export { " + change_case_1.pascalCase(item) + "APIService, I" + change_case_1.pascalCase(item) + "APIService } from './" + change_case_1.paramCase(item) + ".service';");
        }
        imports.push('');
        try {
            fs.writeFileSync(path.resolve(this.out + '/services/index.ts'), imports.join('\r\n'));
        }
        catch (e) {
            this._logger.err('[ ERROR ] file: ' + this.out + '/services/index.ts');
        }
    };
    TemplatePrinter.prototype.printModelIndex = function (models) {
        var imports = [];
        for (var _i = 0, models_2 = models; _i < models_2.length; _i++) {
            var item = models_2[_i];
            imports.push("export { " + item.name + " } from './" + change_case_1.paramCase(item.name).replace(/^i-/gi, '') + ".model';");
        }
        imports.push("export * from './enums';");
        imports.push('');
        try {
            fs.writeFileSync(path.resolve(this.out + '/models/index.ts'), imports.join('\r\n'));
        }
        catch (e) {
            this._logger.err('[ ERROR ] file: ' + this.out + '/models/index.ts');
        }
    };
    TemplatePrinter.prototype.printEnumIndex = function (enums) {
        var imports = [];
        for (var _i = 0, enums_2 = enums; _i < enums_2.length; _i++) {
            var item = enums_2[_i];
            imports.push("export {" + item.name + "} from './" + change_case_1.paramCase(item.name) + ".enum';");
        }
        imports.push('');
        try {
            fs.writeFileSync(path.resolve(this.out + '/models/enums/index.ts'), imports.join('\r\n'));
        }
        catch (e) {
            this._logger.err('[ ERROR ] file: ' + this.out + '/models/enums/index.ts');
        }
    };
    TemplatePrinter.prototype.getTemplate = function (type) {
        var template = '';
        if (this._templateFolder && fs.existsSync(path.resolve(process.cwd(), this._templateFolder, type + ".ejs"))) {
            template = path.resolve(process.cwd(), this._templateFolder, type + ".ejs");
        }
        else if (fs.existsSync(path.resolve(this._stdTemplateFolder, type + ".ejs"))) {
            template = path.resolve(this._stdTemplateFolder, type + ".ejs");
        }
        else if (fs.existsSync(path.resolve(this._singleFileTemplateFolrder, type + ".ejs"))) {
            template = path.resolve(this._singleFileTemplateFolrder, type + ".ejs");
        }
        else {
            this._logger.err('[ ERROR ] template: not found!');
            return '';
        }
        return template;
    };
    return TemplatePrinter;
}());
exports.TemplatePrinter = TemplatePrinter;
//# sourceMappingURL=template-printer.js.map