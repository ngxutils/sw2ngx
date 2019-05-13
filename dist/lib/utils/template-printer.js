"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var module_1 = require("./templates/module");
var service_1 = require("./templates/service");
var logger_1 = require("./logger");
var enum_1 = require("./templates/enum");
var fs = require("fs");
var path = require("path");
var model_1 = require("./templates/model");
var change_case_1 = require("change-case");
var TemplatePrinter = /** @class */ (function () {
    function TemplatePrinter() {
        this.out = '';
        this.enumCompiler = new enum_1.EnumTemplate();
        this.modelCompiler = new model_1.ModelTemplate();
        this.serviceCompiler = new service_1.ServiceTemplate();
        this.moduleCompiler = new module_1.ModuleTemplate();
        this._printedServices = [];
        this._logger = new logger_1.Logger();
    }
    TemplatePrinter.prototype.cleanFolder = function () {
        var _this = this;
        this._logger.info('clean start');
        return new Promise(function (resolve, reject) {
            var deleteFolderRecursive = function (path) {
                if (fs.existsSync(path)) {
                    fs.readdirSync(path).forEach(function (file, index) {
                        var curPath = path + "/" + file;
                        if (fs.lstatSync(curPath).isDirectory()) { // recurse
                            deleteFolderRecursive(curPath);
                        }
                        else { // delete file
                            fs.unlinkSync(curPath);
                        }
                    });
                    fs.rmdirSync(path);
                }
            };
            try {
                deleteFolderRecursive(path.resolve(_this.out));
                resolve();
            }
            catch (e) {
                reject(e);
            }
        });
    };
    TemplatePrinter.prototype.createFolders = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.cleanFolder().then(function () {
                fs.mkdirSync(path.resolve(_this.out));
                fs.mkdirSync(path.resolve(_this.out + '/models'));
                fs.mkdirSync(path.resolve(_this.out + '/models/enums'));
                fs.mkdirSync(path.resolve(_this.out + '/services'));
                resolve();
            }).catch(function () { reject(); });
        });
    };
    TemplatePrinter.prototype.print = function (enums, models, services, out) {
        var _this = this;
        this.out = out;
        return new Promise(function (resolve, reject) {
            _this.createFolders().then(function () {
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
                    if (services.hasOwnProperty(name_1)) {
                        _this.printService(services[name_1], name_1);
                    }
                }
                _this.printServiceIndex();
                _this.printModule();
                _this.printIndex();
                resolve();
            });
        });
    };
    TemplatePrinter.prototype.printEnum = function (value) {
        var compiled = this.enumCompiler.compile(value);
        // this._logger.ok(path.resolve(this.out + '/models/enums/' + value.name + '.enum.ts'));
        try {
            fs.writeFileSync(path.resolve(this.out + '/models/enums/' + change_case_1.kebabCase(value.name) + '.enum.ts'), compiled);
        }
        catch (e) {
            this._logger.err('[ ERROR ] file: ' + this.out + '/models/enums/' + value.name + '.enum.ts');
        }
    };
    TemplatePrinter.prototype.printModel = function (model) {
        var _this = this;
        var compiled = this.modelCompiler.compile(model);
        /// this._logger.ok(path.resolve(this.out + '/models/' + model.name + '.model.ts'));
        fs.writeFile(path.resolve(this.out + '/models/' + change_case_1.kebabCase(model.name) + '.model.ts'), compiled, function (err) {
            if (err) {
                _this._logger.err('[ ERROR ] file: ' + _this.out + '/models/' + model.name + '.model.ts');
                return;
            }
            _this._logger.ok('[ OK    ] file: ' + _this.out + '/models/' + model.name + '.model.ts');
        });
    };
    TemplatePrinter.prototype.printService = function (service, name) {
        var _this = this;
        var compiled = this.serviceCompiler.compile(service, name);
        if (compiled !== '') {
            this._printedServices.push(name);
            fs.writeFile(path.resolve(this.out + '/services/' + change_case_1.kebabCase(name) + '.service.ts'), compiled, function (err) {
                if (err) {
                    _this._logger.err('[ ERROR ] file: ' + _this.out + '/services/' + name + '.service.ts');
                    return;
                }
                _this._logger.ok('[ OK    ] file: ' + _this.out + '/services/' + name + '.service.ts');
            });
        }
    };
    TemplatePrinter.prototype.printModule = function () {
        var _this = this;
        var compiled = this.moduleCompiler.compile(this._printedServices);
        fs.writeFile(path.resolve(this.out + '/api.module.ts'), compiled, function (err) {
            if (err) {
                _this._logger.err('[ ERROR ] file: ' + _this.out + '/api.module.ts');
                return;
            }
            _this._logger.ok('[ OK    ] file: ' + _this.out + '/api.module.ts');
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
            imports.push("export { " + item + "APIService, I" + item + "APIService } from './" + item + ".service';");
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
            imports.push("export { " + item.name + ", I" + item.name + " } from './" + item.name + ".model';");
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
            imports.push("export {" + item.name + "} from './" + item.name + ".enum';");
        }
        imports.push('');
        try {
            fs.writeFileSync(path.resolve(this.out + '/models/enums/index.ts'), imports.join('\r\n'));
        }
        catch (e) {
            this._logger.err('[ ERROR ] file: ' + this.out + '/models/enums/index.ts');
        }
    };
    return TemplatePrinter;
}());
exports.TemplatePrinter = TemplatePrinter;
//# sourceMappingURL=template-printer.js.map