import { ModuleTemplate } from './templates/module';
import { ServiceTemplate } from './templates/service';
import { Logger } from './logger';
import { EnumTemplate } from './templates/enum';
import { IParserEnum, IParserServiceList, IParserModel, IParserService } from './../interfaces/parser';
import rimraf from 'rimraf';
import * as fs from 'fs';
import * as path from 'path';
import { ModelTemplate } from './templates/model';
import { paramCase } from 'change-case';

export class TemplatePrinter {
  private out: string = '';
  private enumCompiler: EnumTemplate = new EnumTemplate();
  private modelCompiler: ModelTemplate = new ModelTemplate();
  private serviceCompiler: ServiceTemplate = new ServiceTemplate();
  private moduleCompiler: ModuleTemplate = new ModuleTemplate();
  private _printedServices: string[] = [];
  private _logger: Logger = new Logger();

  public cleanFolder(): Promise<boolean> {
    this._logger.info('clean start');
    return new Promise<boolean>((resolve, reject) => {
      const deleteFolderRecursive = (path: string) => {
        if (fs.existsSync(path)) {
          fs.readdirSync(path).forEach(function (file, index) {
            const curPath = path + "/" + file;
            if (fs.lstatSync(curPath).isDirectory()) { // recurse
              deleteFolderRecursive(curPath);
            } else { // delete file
              fs.unlinkSync(curPath);
            }
          });
          fs.rmdirSync(path);
        }
      }
      try {
        deleteFolderRecursive(path.resolve(this.out));
        resolve();
      } catch (e) {
        reject(e);
      }

    });
  }
  public createFolders() {
    return new Promise(
      (resolve, reject) => {
        this.cleanFolder().then(() => {
          fs.mkdirSync(path.resolve(this.out));
          fs.mkdirSync(path.resolve(this.out + '/models'));
          fs.mkdirSync(path.resolve(this.out + '/models/enums'));
          fs.mkdirSync(path.resolve(this.out + '/services'));
          resolve();
        }).catch(() => { reject(); })
      }
    );
  }

  public print(enums: IParserEnum[], models: IParserModel[], services: IParserServiceList, out: string): Promise<any> {
    this.out = out;
    return new Promise<any>((resolve, reject) => {
      this.createFolders().then(() => {
        for (const item of enums) {
          this.printEnum(item);
        }
        this.printEnumIndex(enums);
        for (const item of models) {
          this.printModel(item);
        }
        this.printModelIndex(models);
        for (const name in services) {
          if (services.hasOwnProperty(name)) {
            this.printService(services[name], name);
          }
        }
        this.printServiceIndex();
        this.printModule();
        this.printIndex();
        resolve();
      });
    });

  }
  public printEnum(value: IParserEnum) {
    const compiled = this.enumCompiler.compile(value);
    // this._logger.ok(path.resolve(this.out + '/models/enums/' + value.name + '.enum.ts'));
    try {
      fs.writeFileSync(path.resolve(this.out + '/models/enums/' + paramCase(value.name) + '.enum.ts'), compiled);
    } catch (e) {
      this._logger.err('[ ERROR ] file: ' + this.out + '/models/enums/' + value.name + '.enum.ts');
    }

  }
  public printModel(model: IParserModel) {
    const compiled = this.modelCompiler.compile(model);
    /// this._logger.ok(path.resolve(this.out + '/models/' + model.name + '.model.ts'));

    fs.writeFile(path.resolve(this.out + '/models/' + paramCase(model.name) + '.model.ts'), compiled, (err) => {
      if (err) {
        this._logger.err('[ ERROR ] file: ' + this.out + '/models/' + model.name + '.model.ts');
        return;
      }
      this._logger.ok('[ OK    ] file: ' + this.out + '/models/' + model.name + '.model.ts');
    });

  }
  public printService(service: IParserService, name: string) {
    const compiled = this.serviceCompiler.compile(service, name);
    if (compiled !== '') {
      this._printedServices.push(name);
      fs.writeFile(path.resolve(this.out + '/services/' + paramCase(name) + '.service.ts'), compiled, (err) => {
        if (err) {
          this._logger.err('[ ERROR ] file: ' + this.out + '/services/' + name + '.service.ts');
          return;
        }
        this._logger.ok('[ OK    ] file: ' + this.out + '/services/' + name + '.service.ts');
      });
    }
  }
  public printModule() {
    const compiled = this.moduleCompiler.compile(this._printedServices);
    fs.writeFile(path.resolve(this.out + '/api.module.ts'), compiled, (err) => {
      if (err) {
        this._logger.err('[ ERROR ] file: ' + this.out + '/api.module.ts');
        return;
      }
      this._logger.ok('[ OK    ] file: ' + this.out + '/api.module.ts');
    });
  }
  public printIndex() {
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
  public printServiceIndex() {
    const imports = [];
    for (let item of this._printedServices) {
      imports.push(`export { ${item}APIService, I${item}APIService } from './${paramCase(item)}.service';`);
    }
    imports.push('');
    try {
      fs.writeFileSync(path.resolve(this.out + '/services/index.ts'), imports.join('\r\n'));
    } catch (e) {
      this._logger.err('[ ERROR ] file: ' + this.out + '/services/index.ts');
    }
  }
  public printModelIndex(models: IParserModel[]) {
    const imports = [];
    for (let item of models) {
      imports.push(`export { ${item.name}, I${item.name} } from './${paramCase(item.name)}.model';`);
    }
    imports.push(`export * from './enums';`);
    imports.push('');
    try {
      fs.writeFileSync(path.resolve(this.out + '/models/index.ts'), imports.join('\r\n'));
    } catch (e) {
      this._logger.err('[ ERROR ] file: ' + this.out + '/models/index.ts');
    }
  }
  public printEnumIndex(enums: IParserEnum[]) {
    const imports = [];
    for (let item of enums) {
      imports.push(`export {${item.name}} from './${paramCase(item.name)}.enum';`);
    }
    imports.push('');
    try {
      fs.writeFileSync(path.resolve(this.out + '/models/enums/index.ts'), imports.join('\r\n'));
    } catch (e) {
      this._logger.err('[ ERROR ] file: ' + this.out + '/models/enums/index.ts');
    }
  }


}
