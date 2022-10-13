"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TemplatePrinterService = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const process = __importStar(require("process"));
const change_case_1 = require("change-case");
const ejs = __importStar(require("ejs"));
const rxjs_1 = require("rxjs");
const fromArray_1 = require("rxjs/internal/observable/fromArray");
const operators_1 = require("rxjs/operators");
const tsyringe_1 = require("tsyringe");
const configuration_repository_1 = require("../configuration.repository");
const logger_1 = require("../logger");
let TemplatePrinterService = class TemplatePrinterService {
    constructor(logger, sw2ngxConfiguration) {
        this.logger = logger;
        this.sw2ngxConfiguration = sw2ngxConfiguration;
    }
    get config() {
        if (this.sw2ngxConfiguration) {
            return this.sw2ngxConfiguration.config.pipe(operators_1.filter((x) => !!x));
        }
        return rxjs_1.of();
    }
    print(apiDefinition) {
        var _a;
        (_a = this.logger) === null || _a === void 0 ? void 0 : _a.info('Start Printing templates');
        return this.createGeneratorFolder(apiDefinition).pipe(operators_1.filter((x) => !!x), operators_1.switchMap((outPath) => {
            var _a, _b, _c;
            return rxjs_1.combineLatest([
                this.printModelsStream(apiDefinition.models, outPath, apiDefinition.enums.length > 0, ((_c = (_b = (_a = this.sw2ngxConfiguration) === null || _a === void 0 ? void 0 : _a.config) === null || _b === void 0 ? void 0 : _b.value) === null || _c === void 0 ? void 0 : _c.readOnlyModels) || false),
                this.printEnumsStream(apiDefinition.enums, outPath),
                this.printServiceStream(apiDefinition.services, outPath),
                this.printInternals(outPath),
                this.printIndex(outPath, ['models', 'services', 'internals']),
            ]);
        }), operators_1.map((res) => {
            return res.reduce((acc, result) => acc && result);
        }));
    }
    createGeneratorFolder(apiDefinition) {
        return this.config.pipe(operators_1.map((config) => {
            return path.resolve(process.cwd(), config.outputPath);
        }), operators_1.map((outPath) => {
            try {
                if (!fs.existsSync(outPath)) {
                    fs.mkdirSync(outPath);
                }
                fs.chmodSync(outPath, 0o777);
                if (!fs.existsSync(path.resolve(outPath, 'services'))) {
                    fs.mkdirSync(path.resolve(outPath, 'services'));
                }
                fs.chmodSync(path.resolve(outPath, 'services'), 0o777);
                if (!fs.existsSync(path.resolve(outPath, 'models'))) {
                    fs.mkdirSync(path.resolve(outPath, 'models'));
                }
                fs.chmodSync(path.resolve(outPath, 'models'), 0o777);
                if (apiDefinition.enums.length > 0) {
                    if (!fs.existsSync(path.resolve(outPath, 'models/enums'))) {
                        fs.mkdirSync(path.resolve(outPath, 'models/enums'));
                    }
                    fs.chmodSync(path.resolve(outPath, 'models/enums'), 0o777);
                }
                return outPath;
            }
            catch (error) {
                return false;
            }
        }));
    }
    printModelsStream(models, out, hasEnums, readOnlyProperties) {
        const indexTemplate = [
            hasEnums ? "export * from './enums'" : '',
            ...models
                .map((model) => model.name)
                .map((modelName) => `export { ${modelName} } from './${change_case_1.paramCase(modelName) + '.model'}';`),
        ].join('\r\n');
        return this.getTemplate('model').pipe(operators_1.switchMap((template) => {
            const templatedModels = models.map((model) => [template, model]);
            return fromArray_1.fromArray(templatedModels);
        }), operators_1.mergeMap(([template, model]) => {
            return new rxjs_1.Observable((rendered$) => {
                ejs.renderFile(template, {
                    model: model,
                    readOnly: readOnlyProperties,
                }, {}, (err, render) => {
                    if (err) {
                        rendered$.next([model.name, 'error']);
                        rendered$.complete();
                        return;
                    }
                    rendered$.next([model.name, render]);
                    rendered$.complete();
                });
            });
        }), operators_1.mergeMap(([templateName, rendered]) => {
            return new rxjs_1.Observable((written$) => {
                if (rendered !== 'error') {
                    fs.writeFile(path.resolve(out, 'models', change_case_1.paramCase(templateName) + '.model.ts'), rendered, (err) => {
                        if (err) {
                            written$.next([templateName, false]);
                        }
                        else {
                            written$.next([templateName, true]);
                        }
                        written$.complete();
                    });
                }
                else {
                    written$.next([templateName, false]);
                    written$.complete();
                }
            });
        }), operators_1.tap(([modelName, isPrinted]) => {
            var _a, _b;
            if (isPrinted) {
                (_a = this.logger) === null || _a === void 0 ? void 0 : _a.ok(`[ OK ] model: ${change_case_1.pascalCase(modelName)}`);
            }
            else {
                (_b = this.logger) === null || _b === void 0 ? void 0 : _b.err(`ERROR: ${modelName} file write`);
            }
        }), operators_1.take(models.length), operators_1.reduce((acc, [, success]) => {
            return acc && success;
        }, true), operators_1.tap(() => {
            fs.writeFile(path.resolve(out, 'models', 'index.ts'), indexTemplate, (err) => {
                var _a;
                if (err) {
                    (_a = this.logger) === null || _a === void 0 ? void 0 : _a.err('ERROR: write models index');
                }
            });
        }));
    }
    printEnumsStream(enums, out) {
        if (enums.length > 0) {
            const enumsIndexTemplate = enums
                .filter((x) => !x.isPremitive)
                .map((enumItem) => enumItem.name)
                .map((name) => `export { ${name} } from './${change_case_1.paramCase(name)}.enum';`)
                .join('\r\n');
            return this.getTemplate('enum').pipe(operators_1.switchMap((template) => {
                const enumsTemplated = enums
                    .filter((x) => !x.isPremitive)
                    .map((value) => [template, value]);
                return fromArray_1.fromArray(enumsTemplated);
            }), operators_1.mergeMap(([template, value]) => this.renderEjsTemplate(template, {
                value: value,
            }, value.name)), operators_1.mergeMap(([enumName, rendered]) => this.writeFileType(out, change_case_1.paramCase(enumName), rendered, 'enum')), operators_1.tap(([modelName, isPrinted]) => {
                var _a, _b;
                if (isPrinted) {
                    (_a = this.logger) === null || _a === void 0 ? void 0 : _a.ok(`[ OK ] enum: ${change_case_1.pascalCase(modelName)}`);
                }
                else {
                    (_b = this.logger) === null || _b === void 0 ? void 0 : _b.err(`ERROR: ${modelName} file write`);
                }
            }), operators_1.take(enums.length), operators_1.reduce((acc, [, success]) => {
                return acc && success;
            }, true), operators_1.tap(() => {
                fs.writeFile(path.resolve(out, 'models/enums', 'index.ts'), enumsIndexTemplate, (err) => {
                    var _a;
                    if (err) {
                        (_a = this.logger) === null || _a === void 0 ? void 0 : _a.err('ERROR: write models index');
                    }
                });
            }));
        }
        return rxjs_1.of(true);
    }
    printServiceStream(services, outPath) {
        var _a;
        const activeServices = services.filter((service) => service.methods.length > 0);
        const parserConfigValue = (_a = this.sw2ngxConfiguration) === null || _a === void 0 ? void 0 : _a.config.value;
        const servicesIndexTemplate = activeServices
            .map((service) => `export { ${change_case_1.pascalCase(service.name)}ApiService ${(parserConfigValue === null || parserConfigValue === void 0 ? void 0 : parserConfigValue.genServiceInterfaces)
            ? ', I' + change_case_1.pascalCase(service.name) + 'ApiService'
            : ''} } from './${change_case_1.paramCase(service.name)}.service';`)
            .join('\r\n');
        return this.getTemplate('service').pipe(operators_1.switchMap((template) => {
            return fromArray_1.fromArray(activeServices.map((service) => [template, service]));
        }), operators_1.mergeMap(([template, service]) => this.renderEjsTemplate(template, {
            service: service,
            fnPascalCase: change_case_1.pascalCase,
            providedIn: (parserConfigValue === null || parserConfigValue === void 0 ? void 0 : parserConfigValue.provideIn) || 'root',
            genSrvInterface: (parserConfigValue === null || parserConfigValue === void 0 ? void 0 : parserConfigValue.genServiceInterfaces) || false,
        }, service.name)), operators_1.mergeMap(([serviceName, rendered]) => this.writeFileType(outPath, change_case_1.paramCase(serviceName), rendered, 'service')), operators_1.tap(([serviceName, isPrinted]) => {
            var _a, _b;
            if (isPrinted) {
                (_a = this.logger) === null || _a === void 0 ? void 0 : _a.ok(`[ OK ] service: ${change_case_1.pascalCase(serviceName)}`);
            }
            else {
                (_b = this.logger) === null || _b === void 0 ? void 0 : _b.err(`ERROR: ${serviceName} file write`);
            }
        }), operators_1.take(activeServices.length), operators_1.reduce((acc, [, success]) => {
            return acc && success;
        }, true), operators_1.tap(() => {
            fs.writeFile(path.resolve(outPath, 'services', 'index.ts'), servicesIndexTemplate, (err) => {
                var _a;
                if (err) {
                    (_a = this.logger) === null || _a === void 0 ? void 0 : _a.err('ERROR: write models index');
                }
            });
        }));
    }
    printInternals(outPath) {
        return this.getTemplate('internals').pipe(operators_1.switchMap((template) => this.renderEjsTemplate(template, {}, 'internals')), operators_1.mergeMap(([, render]) => this.writeFileType(outPath, 'internals', render, 'internals')), operators_1.take(1), operators_1.reduce((acc, [, success]) => {
            return acc && success;
        }, true));
    }
    printIndex(outPath, indexPaths = ['models', 'services']) {
        const fileBody = indexPaths
            .map((exportPath) => `export * from './${exportPath}';`)
            .join('\r\n');
        return new rxjs_1.Observable((indexPrinted$) => {
            fs.writeFile(path.resolve(outPath, `index.ts`), fileBody, (err) => {
                if (err) {
                    indexPrinted$.next(false);
                }
                else {
                    indexPrinted$.next(true);
                }
                indexPrinted$.complete();
            });
        });
    }
    getTemplate(type) {
        return this.config.pipe(operators_1.switchMap((config) => {
            const templatePath = path.resolve(process.cwd(), config.templates, `${type}.ejs`);
            return fs.existsSync(templatePath)
                ? rxjs_1.of(templatePath)
                : rxjs_1.throwError('ERROR: failed to get the template');
        }));
    }
    renderEjsTemplate(template, templateData, entityName) {
        return new rxjs_1.Observable((rendered$) => {
            ejs.renderFile(template, templateData, (err, render) => {
                if (err) {
                    rendered$.next([entityName, 'error']);
                }
                else {
                    rendered$.next([entityName, render]);
                }
                rendered$.complete();
            });
        });
    }
    writeFileType(outPath, fileName, fileBody, fileType) {
        const filesFolderByType = {
            model: 'models',
            enum: 'models/enums',
            service: 'services',
            internals: '',
        };
        const fileSuffix = {
            model: '.model',
            enum: '.enum',
            service: '.service',
            internals: '',
        };
        return new rxjs_1.Observable((written$) => {
            if (fileBody !== 'error') {
                fs.writeFile(path.resolve(outPath, filesFolderByType[fileType], `${fileName}${fileSuffix[fileType]}.ts`), fileBody, (err) => {
                    if (err) {
                        written$.next([fileName, false]);
                    }
                    else {
                        written$.next([fileName, true]);
                    }
                    written$.complete();
                });
            }
            else {
                written$.next([fileName, false]);
                written$.complete();
            }
        });
    }
};
TemplatePrinterService = __decorate([
    tsyringe_1.singleton(),
    __metadata("design:paramtypes", [logger_1.Logger,
        configuration_repository_1.ConfigurationRepository])
], TemplatePrinterService);
exports.TemplatePrinterService = TemplatePrinterService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVtcGxhdGUtcHJpbnRlci5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2xpYi9wcmludGVyL3RlbXBsYXRlLXByaW50ZXIuc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsdUNBQXlCO0FBQ3pCLDJDQUE2QjtBQUM3QixpREFBbUM7QUFFbkMsNkNBQW9EO0FBQ3BELHlDQUEyQjtBQUMzQiwrQkFBaUU7QUFDakUsa0VBQStEO0FBQy9ELDhDQVF3QjtBQUN4Qix1Q0FBcUM7QUFFckMsMEVBQXNFO0FBQ3RFLHNDQUFtQztBQUduQyxJQUFhLHNCQUFzQixHQUFuQyxNQUFhLHNCQUFzQjtJQVNqQyxZQUNVLE1BQWUsRUFDZixtQkFBNkM7UUFEN0MsV0FBTSxHQUFOLE1BQU0sQ0FBUztRQUNmLHdCQUFtQixHQUFuQixtQkFBbUIsQ0FBMEI7SUFDcEQsQ0FBQztJQVhKLElBQVksTUFBTTtRQUNoQixJQUFJLElBQUksQ0FBQyxtQkFBbUIsRUFBRTtZQUM1QixPQUFPLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUN6QyxrQkFBTSxDQUFDLENBQUMsQ0FBQyxFQUFxQixFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUN0QyxDQUFDO1NBQ0g7UUFDRCxPQUFPLFNBQUUsRUFBRSxDQUFDO0lBQ2QsQ0FBQztJQUtELEtBQUssQ0FBQyxhQUFrQzs7UUFDdEMsTUFBQSxJQUFJLENBQUMsTUFBTSwwQ0FBRSxJQUFJLENBQUMsMEJBQTBCLENBQUMsQ0FBQztRQUM5QyxPQUFPLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxhQUFhLENBQUMsQ0FBQyxJQUFJLENBQ25ELGtCQUFNLENBQUMsQ0FBQyxDQUFDLEVBQWUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDL0IscUJBQVMsQ0FBQyxDQUFDLE9BQU8sRUFB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