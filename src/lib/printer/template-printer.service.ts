import * as fs from 'fs';
import * as path from 'path';
import * as process from 'process';

import { paramCase, pascalCase } from 'change-case';
import * as ejs from 'ejs';
import { combineLatest, Observable, of, throwError } from 'rxjs';
import { fromArray } from 'rxjs/internal/observable/fromArray';
import {
  filter,
  map,
  mergeMap,
  reduce,
  switchMap,
  take,
  tap,
} from 'rxjs/operators';
import { singleton } from 'tsyringe';

import { ConfigurationRepository } from '../configuration.repository';
import { Logger } from '../logger';

@singleton()
export class TemplatePrinterService {
  private get config(): Observable<Sw2NgxConfig> {
    if (this.sw2ngxConfiguration) {
      return this.sw2ngxConfiguration.config.pipe(
        filter((x): x is Sw2NgxConfig => !!x)
      );
    }
    return of();
  }
  constructor(
    private logger?: Logger,
    private sw2ngxConfiguration?: ConfigurationRepository
  ) {}
  print(apiDefinition: Sw2NgxApiDefinition): Observable<boolean> {
    this.logger?.info('Start Printing templates');
    return this.createGeneratorFolder(apiDefinition).pipe(
      filter((x): x is string => !!x),
      switchMap((outPath) => {
        return combineLatest([
          this.printModelsStream(
            apiDefinition.models,
            outPath,
            apiDefinition.enums.length > 0,
            this.sw2ngxConfiguration?.config?.value?.readOnlyModels || false
          ),
          this.printEnumsStream(apiDefinition.enums, outPath),
          this.printServiceStream(apiDefinition.services, outPath),
          this.printInternals(outPath),
          this.printIndex(outPath, ['models', 'services', 'internals']),
        ]);
      }),
      map((res) => {
        return res.reduce((acc, result) => acc && result);
      })
    );
  }
  private createGeneratorFolder(
    apiDefinition: Sw2NgxApiDefinition
  ): Observable<string | boolean> {
    return this.config.pipe(
      map((config) => {
        return path.resolve(process.cwd(), config.outputPath);
      }),
      map((outPath) => {
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
        } catch (error) {
          return false;
        }
      })
    );
  }

  private printModelsStream(
    models: Sw2NgxModel[],
    out: string,
    hasEnums: boolean,
    readOnlyProperties: boolean
  ): Observable<boolean> {
    const indexTemplate = [
      hasEnums ? "export * from './enums'" : '',
      ...models
        .map((model) => model.name)
        .map(
          (modelName) =>
            `export { ${modelName} } from './${
              paramCase(modelName) + '.model'
            }';`
        ),
    ].join('\r\n');

    return this.getTemplate('model').pipe(
      switchMap((template) => {
        const templatedModels: Array<
          [string, Sw2NgxModel]
        > = models.map((model) => [template, model]);
        return fromArray(templatedModels);
      }),
      mergeMap(([template, model]: [string, Sw2NgxModel]) => {
        return new Observable<[string, string]>((rendered$) => {
          ejs.renderFile(
            template,
            {
              model: model,
              readOnly: readOnlyProperties,
            },
            {},
            (err: unknown | undefined, render: string) => {
              if (err) {
                rendered$.next([model.name, 'error']);
                rendered$.complete();
                return;
              }
              rendered$.next([model.name, render]);
              rendered$.complete();
            }
          );
        });
      }),
      mergeMap(([templateName, rendered]: [string, string]) => {
        return new Observable<[string, boolean]>((written$) => {
          if (rendered !== 'error') {
            fs.writeFile(
              path.resolve(
                out,
                'models',
                paramCase(templateName)+ '.model.ts'
              ),
              rendered,
              (err) => {
                if (err) {
                  written$.next([templateName, false]);
                } else {
                  written$.next([templateName, true]);
                }
                written$.complete();
              }
            );
          } else {
            written$.next([templateName, false]);
            written$.complete();
          }
        });
      }),
      tap(([modelName, isPrinted]) => {
        if (isPrinted) {
          this.logger?.ok(`[ OK ] model: ${pascalCase(modelName)}`);
        } else {
          this.logger?.err(`ERROR: ${modelName} file write`);
        }
      }),
      take(models.length),
      reduce((acc: boolean, [, success]: [string, boolean]) => {
        return acc && success;
      }, true),
      tap(() => {
        fs.writeFile(
          path.resolve(out, 'models', 'index.ts'),
          indexTemplate,
          (err) => {
            if (err) {
              this.logger?.err('ERROR: write models index');
            }
          }
        );
      })
    );
  }
  private printEnumsStream(
    enums: Sw2NgxEnum[],
    out: string
  ): Observable<boolean> {
    if (enums.length > 0) {
      const enumsIndexTemplate = enums
        .filter((x) => !x.isPremitive)
        .map((enumItem) => enumItem.name)
        .map((name) => `export { ${name} } from './${paramCase(name)}.enum';`)
        .join('\r\n');
      return this.getTemplate('enum').pipe(
        switchMap(
          (template): Observable<[string, Sw2NgxEnum]> => {
            const enumsTemplated: [string, Sw2NgxEnum][] = enums
              .filter((x) => !x.isPremitive)
              .map((value) => [template, value]);
            return fromArray(enumsTemplated);
          }
        ),
        mergeMap(([template, value]: [string, Sw2NgxEnum]) =>
          this.renderEjsTemplate(
            template,
            {
              value: value,
            },
            value.name
          )
        ),
        mergeMap(([enumName, rendered]) =>
          this.writeFileType(out, paramCase(enumName), rendered, 'enum')
        ),
        tap(([modelName, isPrinted]) => {
          if (isPrinted) {
            this.logger?.ok(`[ OK ] enum: ${pascalCase(modelName)}`);
          } else {
            this.logger?.err(`ERROR: ${modelName} file write`);
          }
        }),
        take(enums.length),
        reduce((acc: boolean, [, success]: [string, boolean]) => {
          return acc && success;
        }, true),
        tap(() => {
          fs.writeFile(
            path.resolve(out, 'models/enums', 'index.ts'),
            enumsIndexTemplate,
            (err) => {
              if (err) {
                this.logger?.err('ERROR: write models index');
              }
            }
          );
        })
      );
    }
    return of(true);
  }
  private printServiceStream(
    services: Sw2NgxService[],
    outPath: string
  ): Observable<boolean> {
    const activeServices = services.filter(
      (service) => service.methods.length > 0
    );

    const parserConfigValue = this.sw2ngxConfiguration?.config.value;
    const servicesIndexTemplate = activeServices
      .map(
        (service) =>
          `export { ${pascalCase(service.name)}ApiService ${
            parserConfigValue?.genServiceInterfaces
              ? ', I' + pascalCase(service.name) + 'ApiService'
              : ''
          } } from './${paramCase(service.name)}.service';`
      )
      .join('\r\n');
    return this.getTemplate('service').pipe(
      switchMap(
        (template): Observable<[string, Sw2NgxService]> => {
          return fromArray(
            activeServices.map((service) => [template, service])
          );
        }
      ),
      mergeMap(([template, service]: [string, Sw2NgxService]) =>
        this.renderEjsTemplate(
          template,
          {
            service: service,
            fnPascalCase: pascalCase,
            providedIn: parserConfigValue?.provideIn || 'root',
            genSrvInterface: parserConfigValue?.genServiceInterfaces || false,
          },
          service.name
        )
      ),
      mergeMap(([serviceName, rendered]) =>
        this.writeFileType(outPath, paramCase(serviceName), rendered, 'service')
      ),
      tap(([serviceName, isPrinted]) => {
        if (isPrinted) {
          this.logger?.ok(`[ OK ] service: ${pascalCase(serviceName)}`);
        } else {
          this.logger?.err(`ERROR: ${serviceName} file write`);
        }
      }),
      take(activeServices.length),
      reduce((acc: boolean, [, success]: [string, boolean]) => {
        return acc && success;
      }, true),
      tap(() => {
        fs.writeFile(
          path.resolve(outPath, 'services', 'index.ts'),
          servicesIndexTemplate,
          (err) => {
            if (err) {
              this.logger?.err('ERROR: write models index');
            }
          }
        );
      })
    );
  }

  private printInternals(outPath: string): Observable<boolean> {
    return this.getTemplate('internals').pipe(
      switchMap((template) =>
        this.renderEjsTemplate(template, {}, 'internals')
      ),
      mergeMap(([, render]) =>
        this.writeFileType(outPath, 'internals', render, 'internals')
      ),
      take(1),
      reduce((acc: boolean, [, success]: [string, boolean]) => {
        return acc && success;
      }, true)
    );
  }

  private printIndex(
    outPath: string,
    indexPaths = ['models', 'services']
  ): Observable<boolean> {
    const fileBody = indexPaths
      .map((exportPath) => `export * from './${exportPath}';`)
      .join('\r\n');
    return new Observable<boolean>((indexPrinted$) => {
      fs.writeFile(path.resolve(outPath, `index.ts`), fileBody, (err) => {
        if (err) {
          indexPrinted$.next(false);
        } else {
          indexPrinted$.next(true);
        }
        indexPrinted$.complete();
      });
    });
  }

  private getTemplate(
    type: 'model' | 'service' | 'enum' | 'module' | 'internals'
  ): Observable<string> {
    return this.config.pipe(
      switchMap((config) => {
        const templatePath = path.resolve(
          process.cwd(),
          config.templates,
          `${type}.ejs`
        );
        return fs.existsSync(templatePath)
          ? of(templatePath)
          : throwError('ERROR: failed to get the template');
      })
    );
  }

  private renderEjsTemplate(
    template: string,
    templateData: Record<string, unknown>,
    entityName: string
  ): Observable<[string, 'error' | string]> {
    return new Observable<[string, string]>((rendered$) => {
      ejs.renderFile(template, templateData, (err, render) => {
        if (err) {
          rendered$.next([entityName, 'error']);
        } else {
          rendered$.next([entityName, render]);
        }
        rendered$.complete();
      });
    });
  }

  private writeFileType(
    outPath: string,
    fileName: string,
    fileBody: string,
    fileType: 'model' | 'service' | 'enum' | 'internals'
  ): Observable<[string, boolean]> {
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

    return new Observable<[string, boolean]>((written$) => {
      if (fileBody !== 'error') {
        fs.writeFile(
          path.resolve(
            outPath,
            filesFolderByType[fileType],
            `${fileName}${fileSuffix[fileType]}.ts`
          ),
          fileBody,
          (err) => {
            if (err) {
              written$.next([fileName, false]);
            } else {
              written$.next([fileName, true]);
            }
            written$.complete();
          }
        );
      } else {
        written$.next([fileName, false]);
        written$.complete();
      }
    });
  }
}
