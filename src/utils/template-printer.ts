import { ModuleTemplate } from './templates/module';
import { ServiceTemplate } from './templates/service';
import { Logger } from './logger';
import { EnumTemplate } from './templates/enum';
import {
  IParserEnum,
  IParserServiceList,
  IParserModel,
  IParserService
} from './../interfaces/parser';
import * as fs from 'fs';
import * as path from 'path';
import { ModelTemplate } from './templates/model';
import { paramCase } from 'change-case';

export class TemplatePrinter {
  private out = '';
  private enumCompiler: EnumTemplate = new EnumTemplate();
  private modelCompiler: ModelTemplate = new ModelTemplate();
  private serviceCompiler: ServiceTemplate = new ServiceTemplate();
  private moduleCompiler: ModuleTemplate = new ModuleTemplate();
  private _printedServices: string[] = [];
  private _logger: Logger = new Logger();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public createFolders(): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        fs.mkdirSync(path.resolve(this.out));
        fs.mkdirSync(path.resolve(this.out + '/models'));
        fs.mkdirSync(path.resolve(this.out + '/models/enums'));
        fs.mkdirSync(path.resolve(this.out + '/services'));
        resolve();
        return;
      } catch (error) {
        reject();
      }
    });
  }

  public print(
    enums: IParserEnum[],
    models: IParserModel[],
    services: IParserServiceList,
    out: string
  ): Promise<any> {
    this.out = out;
    return new Promise<any>((resolve, reject) => {
      this.createFolders()
        .then(() => {
          for (const item of enums) {
            this.printEnum(item);
          }
          this.printEnumIndex(enums);
          for (const item of models) {
            this.printModel(item);
          }
          this.printModelIndex(models);
          for (const name in services) {
            if (services[name]) {
              this.printService(services[name], name);
            }
          }
          this.printServiceIndex();
          this.printModule();
          this.printIndex();
          resolve();
        })
        .catch((err) => reject(err));
    });
  }
  public printEnum(value: IParserEnum): void {
    const compiled = this.enumCompiler.compile(value);
    // this._logger.ok(path.resolve(this.out + '/models/enums/' + value.name + '.enum.ts'));
    try {
      fs.writeFileSync(
        path.resolve(
          this.out + '/models/enums/' + paramCase(value.name) + '.enum.ts'
        ),
        compiled
      );
    } catch (e) {
      this._logger.err(
        '[ ERROR ] file: ' +
          this.out +
          '/models/enums/' +
          paramCase(value.name) +
          '.enum.ts'
      );
    }
  }
  public printModel(model: IParserModel): void {
    const compiled = this.modelCompiler.compile(model);
    /// this._logger.ok(path.resolve(this.out + '/models/' + model.name + '.model.ts'));

    fs.writeFile(
      path.resolve(
        this.out +
          '/models/' +
          paramCase(model.name).replace(/^i-/gi, '') +
          '.model.ts'
      ),
      compiled,
      (err) => {
        if (err) {
          this._logger.err(
            '[ ERROR ] file: ' +
              this.out +
              '/models/' +
              paramCase(model.name).replace(/^i-/gi, '') +
              '.model.ts'
          );
          return;
        }
        this._logger.ok(
          '[ OK    ] file: ' +
            this.out +
            '/models/' +
            paramCase(model.name).replace(/^i-/gi, '') +
            '.model.ts'
        );
      }
    );
  }
  public printService(service: IParserService, name: string): void {
    const compiled = this.serviceCompiler.compile(service, name);
    if (compiled !== '') {
      this._printedServices.push(name);
      fs.writeFile(
        path.resolve(this.out + '/services/' + paramCase(name) + '.service.ts'),
        compiled,
        (err) => {
          if (err) {
            this._logger.err(
              '[ ERROR ] file: ' +
                this.out +
                '/services/' +
                paramCase(name) +
                '.service.ts'
            );
            return;
          }
          this._logger.ok(
            '[ OK    ] file: ' +
              this.out +
              '/services/' +
              paramCase(name) +
              '.service.ts'
          );
        }
      );
    }
  }
  public printModule(): void {
    const compiled = this.moduleCompiler.compile(this._printedServices);
    fs.writeFile(path.resolve(this.out + '/api.module.ts'), compiled, (err) => {
      if (err) {
        this._logger.err('[ ERROR ] file: ' + this.out + '/api.module.ts');
        return;
      }
      this._logger.ok('[ OK    ] file: ' + this.out + '/api.module.ts');
    });
  }
  public printIndex(): void {
    const imports = `export * from './services';
export * from './models';
export { APIModule } from './api.module';
`;
    try {
      fs.writeFileSync(path.resolve(this.out + '/index.ts'), imports);
    } catch (e) {
      this._logger.err('[ ERROR ] file: ' + this.out + '/index.ts');
    }
  }
  public printServiceIndex(): void {
    const imports = [];
    for (const item of this._printedServices) {
      imports.push(
        `export { ${item}APIService, I${item}APIService } from './${paramCase(
          item
        )}.service';`
      );
    }
    imports.push('');
    try {
      fs.writeFileSync(
        path.resolve(this.out + '/services/index.ts'),
        imports.join('\r\n')
      );
    } catch (e) {
      this._logger.err('[ ERROR ] file: ' + this.out + '/services/index.ts');
    }
  }
  public printModelIndex(models: IParserModel[]): void {
    const imports = [];
    for (const item of models) {
      imports.push(
        `export { ${item.name} } from './${paramCase(item.name).replace(
          /^i-/gi,
          ''
        )}.model';`
      );
    }
    imports.push(`export * from './enums';`);
    imports.push('');
    try {
      fs.writeFileSync(
        path.resolve(this.out + '/models/index.ts'),
        imports.join('\r\n')
      );
    } catch (e) {
      this._logger.err('[ ERROR ] file: ' + this.out + '/models/index.ts');
    }
  }
  public printEnumIndex(enums: IParserEnum[]): void {
    const imports = [];
    for (const item of enums) {
      imports.push(
        `export {${item.name}} from './${paramCase(item.name)}.enum';`
      );
    }
    imports.push('');
    try {
      fs.writeFileSync(
        path.resolve(this.out + '/models/enums/index.ts'),
        imports.join('\r\n')
      );
    } catch (e) {
      this._logger.err(
        '[ ERROR ] file: ' + this.out + '/models/enums/index.ts'
      );
    }
  }
}
