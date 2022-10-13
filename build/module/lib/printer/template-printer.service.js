var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import * as fs from 'fs';
import * as path from 'path';
import * as process from 'process';
import { paramCase, pascalCase } from 'change-case';
import * as ejs from 'ejs';
import { combineLatest, Observable, of, throwError } from 'rxjs';
import { fromArray } from 'rxjs/internal/observable/fromArray';
import { filter, map, mergeMap, reduce, switchMap, take, tap, } from 'rxjs/operators';
import { singleton } from 'tsyringe';
import { ConfigurationRepository } from '../configuration.repository';
import { Logger } from '../logger';
let TemplatePrinterService = class TemplatePrinterService {
    logger;
    sw2ngxConfiguration;
    get config() {
        if (this.sw2ngxConfiguration) {
            return this.sw2ngxConfiguration.config.pipe(filter((x) => !!x));
        }
        return of();
    }
    constructor(logger, sw2ngxConfiguration) {
        this.logger = logger;
        this.sw2ngxConfiguration = sw2ngxConfiguration;
    }
    print(apiDefinition) {
        this.logger?.info('Start Printing templates');
        return this.createGeneratorFolder(apiDefinition).pipe(filter((x) => !!x), switchMap((outPath) => {
            return combineLatest([
                this.printModelsStream(apiDefinition.models, outPath, apiDefinition.enums.length > 0, this.sw2ngxConfiguration?.config?.value?.readOnlyModels || false),
                this.printEnumsStream(apiDefinition.enums, outPath),
                this.printServiceStream(apiDefinition.services, outPath),
                this.printInternals(outPath),
                this.printIndex(outPath, ['models', 'services', 'internals']),
            ]);
        }), map((res) => {
            return res.reduce((acc, result) => acc && result);
        }));
    }
    createGeneratorFolder(apiDefinition) {
        return this.config.pipe(map((config) => {
            return path.resolve(process.cwd(), config.outputPath);
        }), map((outPath) => {
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
                .map((modelName) => `export { ${modelName} } from './${paramCase(modelName) + '.model'}';`),
        ].join('\r\n');
        return this.getTemplate('model').pipe(switchMap((template) => {
            const templatedModels = models.map((model) => [template, model]);
            return fromArray(templatedModels);
        }), mergeMap(([template, model]) => {
            return new Observable((rendered$) => {
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
        }), mergeMap(([templateName, rendered]) => {
            return new Observable((written$) => {
                if (rendered !== 'error') {
                    fs.writeFile(path.resolve(out, 'models', paramCase(templateName) + '.model.ts'), rendered, (err) => {
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
        }), tap(([modelName, isPrinted]) => {
            if (isPrinted) {
                this.logger?.ok(`[ OK ] model: ${pascalCase(modelName)}`);
            }
            else {
                this.logger?.err(`ERROR: ${modelName} file write`);
            }
        }), take(models.length), reduce((acc, [, success]) => {
            return acc && success;
        }, true), tap(() => {
            fs.writeFile(path.resolve(out, 'models', 'index.ts'), indexTemplate, (err) => {
                if (err) {
                    this.logger?.err('ERROR: write models index');
                }
            });
        }));
    }
    printEnumsStream(enums, out) {
        if (enums.length > 0) {
            const enumsIndexTemplate = enums
                .filter((x) => !x.isPremitive)
                .map((enumItem) => enumItem.name)
                .map((name) => `export { ${name} } from './${paramCase(name)}.enum';`)
                .join('\r\n');
            return this.getTemplate('enum').pipe(switchMap((template) => {
                const enumsTemplated = enums
                    .filter((x) => !x.isPremitive)
                    .map((value) => [template, value]);
                return fromArray(enumsTemplated);
            }), mergeMap(([template, value]) => this.renderEjsTemplate(template, {
                value: value,
            }, value.name)), mergeMap(([enumName, rendered]) => this.writeFileType(out, paramCase(enumName), rendered, 'enum')), tap(([modelName, isPrinted]) => {
                if (isPrinted) {
                    this.logger?.ok(`[ OK ] enum: ${pascalCase(modelName)}`);
                }
                else {
                    this.logger?.err(`ERROR: ${modelName} file write`);
                }
            }), take(enums.length), reduce((acc, [, success]) => {
                return acc && success;
            }, true), tap(() => {
                fs.writeFile(path.resolve(out, 'models/enums', 'index.ts'), enumsIndexTemplate, (err) => {
                    if (err) {
                        this.logger?.err('ERROR: write models index');
                    }
                });
            }));
        }
        return of(true);
    }
    printServiceStream(services, outPath) {
        const activeServices = services.filter((service) => service.methods.length > 0);
        const parserConfigValue = this.sw2ngxConfiguration?.config.value;
        const servicesIndexTemplate = activeServices
            .map((service) => `export { ${pascalCase(service.name)}ApiService ${parserConfigValue?.genServiceInterfaces
            ? ', I' + pascalCase(service.name) + 'ApiService'
            : ''} } from './${paramCase(service.name)}.service';`)
            .join('\r\n');
        return this.getTemplate('service').pipe(switchMap((template) => {
            return fromArray(activeServices.map((service) => [template, service]));
        }), mergeMap(([template, service]) => this.renderEjsTemplate(template, {
            service: service,
            fnPascalCase: pascalCase,
            providedIn: parserConfigValue?.provideIn || 'root',
            genSrvInterface: parserConfigValue?.genServiceInterfaces || false,
        }, service.name)), mergeMap(([serviceName, rendered]) => this.writeFileType(outPath, paramCase(serviceName), rendered, 'service')), tap(([serviceName, isPrinted]) => {
            if (isPrinted) {
                this.logger?.ok(`[ OK ] service: ${pascalCase(serviceName)}`);
            }
            else {
                this.logger?.err(`ERROR: ${serviceName} file write`);
            }
        }), take(activeServices.length), reduce((acc, [, success]) => {
            return acc && success;
        }, true), tap(() => {
            fs.writeFile(path.resolve(outPath, 'services', 'index.ts'), servicesIndexTemplate, (err) => {
                if (err) {
                    this.logger?.err('ERROR: write models index');
                }
            });
        }));
    }
    printInternals(outPath) {
        return this.getTemplate('internals').pipe(switchMap((template) => this.renderEjsTemplate(template, {}, 'internals')), mergeMap(([, render]) => this.writeFileType(outPath, 'internals', render, 'internals')), take(1), reduce((acc, [, success]) => {
            return acc && success;
        }, true));
    }
    printIndex(outPath, indexPaths = ['models', 'services']) {
        const fileBody = indexPaths
            .map((exportPath) => `export * from './${exportPath}';`)
            .join('\r\n');
        return new Observable((indexPrinted$) => {
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
        return this.config.pipe(switchMap((config) => {
            const templatePath = path.resolve(process.cwd(), config.templates, `${type}.ejs`);
            return fs.existsSync(templatePath)
                ? of(templatePath)
                : throwError('ERROR: failed to get the template');
        }));
    }
    renderEjsTemplate(template, templateData, entityName) {
        return new Observable((rendered$) => {
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
        return new Observable((written$) => {
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
    singleton(),
    __metadata("design:paramtypes", [Logger,
        ConfigurationRepository])
], TemplatePrinterService);
export { TemplatePrinterService };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVtcGxhdGUtcHJpbnRlci5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2xpYi9wcmludGVyL3RlbXBsYXRlLXByaW50ZXIuc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFBQSxPQUFPLEtBQUssRUFBRSxNQUFNLElBQUksQ0FBQztBQUN6QixPQUFPLEtBQUssSUFBSSxNQUFNLE1BQU0sQ0FBQztBQUM3QixPQUFPLEtBQUssT0FBTyxNQUFNLFNBQVMsQ0FBQztBQUVuQyxPQUFPLEVBQUUsU0FBUyxFQUFFLFVBQVUsRUFBRSxNQUFNLGFBQWEsQ0FBQztBQUNwRCxPQUFPLEtBQUssR0FBRyxNQUFNLEtBQUssQ0FBQztBQUMzQixPQUFPLEVBQUUsYUFBYSxFQUFFLFVBQVUsRUFBRSxFQUFFLEVBQUUsVUFBVSxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBQ2pFLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxvQ0FBb0MsQ0FBQztBQUMvRCxPQUFPLEVBQ0wsTUFBTSxFQUNOLEdBQUcsRUFDSCxRQUFRLEVBQ1IsTUFBTSxFQUNOLFNBQVMsRUFDVCxJQUFJLEVBQ0osR0FBRyxHQUNKLE1BQU0sZ0JBQWdCLENBQUM7QUFDeEIsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUVyQyxPQUFPLEVBQUUsdUJBQXVCLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQztBQUN0RSxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sV0FBVyxDQUFDO0FBR25DLElBQWEsc0JBQXNCLEdBQW5DLE1BQWEsc0JBQXNCO0lBVXZCO0lBQ0E7SUFWVixJQUFZLE1BQU07UUFDaEIsSUFBSSxJQUFJLENBQUMsbUJBQW1CLEVBQUU7WUFDNUIsT0FBTyxJQUFJLENBQUMsbUJBQW1CLENBQUMsTUFBTSxDQUFDLElBQUksQ0FDekMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFxQixFQUFFLENBQUMsQ0FBQyxDQUFD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