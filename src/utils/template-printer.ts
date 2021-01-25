import { Logger } from './logger';
import {
  IParserEnum,
  IParserServiceList,
  IParserModel,
  IParserService
} from './../interfaces/parser';
import * as fs from 'fs';
import * as path from 'path';
import * as process from 'process'
import { paramCase, pascalCase } from 'change-case';
import * as ejs from 'ejs';
export class TemplatePrinter {
  private out = '';
  private _printedServices: string[] = [];
  private _logger: Logger = new Logger();
  private _templateFolder = '';
  private _stdTemplateFolder = path.resolve( __dirname, '../../templates/default/');
  private _singleFileTemplateFolrder= path.resolve( __dirname, './templates/default/');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public createFolders(): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        fs.mkdirSync(path.resolve(process.cwd(), this.out));
        fs.mkdirSync(path.resolve(process.cwd(), this.out + '/models'));
        fs.mkdirSync(path.resolve(process.cwd(), this.out + '/models/enums'));
        fs.mkdirSync(path.resolve(process.cwd(), this.out + '/services'));
        resolve();
        return;
      } catch (error) {
        reject(error);
      }
    });
  }

  public print(
    enums: IParserEnum[],
    models: IParserModel[],
    services: IParserServiceList,
    out: string,
    templateFolder: string,
    readOnlyProperies: boolean,
    noModule:boolean,
    providedIn: 'root' | 'any' | 'none' | string
  ): Promise<any> {
    this.out = out;
    this._templateFolder = templateFolder? templateFolder: '';
    return new Promise<any>((resolve, reject) => {
      this.createFolders()
        .then(() => {
          for (const item of enums) {
            this.printEnum(item);
          }
          this.printEnumIndex(enums);
          for (const item of models) {
            this.printModel(item, readOnlyProperies);
          }
          this.printModelIndex(models);
          for (const name in services) {
            if (services[name] && services[name].methods.length>0) {
              this.printService(services[name], name, providedIn);
            }
          }
          this.printInternals();
          this.printServiceIndex();
          if(!noModule) {
            this.printModule();
          }
          this.printIndex(noModule);
          resolve();
        })
        .catch((err) => reject(err));
    });
  }
  public printEnum(value: IParserEnum): void {
    const template = this.getTemplate('enum');
    if(template === ''){return}
    ejs.renderFile(template, {
      value: value
    }, {}, (err:any, str:any)=>{
      if(err){
        this._logger.err(`[ ERROR ] EJS print error: ${err}`);
        return;
      }
      try {
        fs.writeFileSync(
          path.resolve(
            process.cwd(),this.out + '/models/enums/' + paramCase(value.name) + '.enum.ts'
          ),
          str
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
    });
    
  }
  public printModel(model: IParserModel, readOnlyProperies: boolean): void {
    const template = this.getTemplate('model');
    if(template === ''){return}
    ejs.renderFile(template, {
      model: model,
      readOnly: readOnlyProperies
    }, {}, (err:any, str:any)=>{
      if(err){
        this._logger.err(`[ ERROR ] EJS print error: ${err}`);
        return;
      }
      fs.writeFile(
        path.resolve(
          process.cwd(),this.out +
            '/models/' +
            paramCase(model.name).replace(/^i-/gi, '') +
            '.model.ts'
        ),
        str,
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
    });
  }
  public printService(service: IParserService, name: string, providedIn: 'root' | 'any' | 'none' | string): void {
    const template = this.getTemplate('service');
    if(template === ''){return}
    ejs.renderFile(template, {
      service: service,
      fnpascalCase: pascalCase,
      name: name,
      providedIn: providedIn
    }, {}, (err:any, str:any)=>{
      if(err){
        this._logger.err(`[ ERROR ] EJS print error: ${err}`);
        return;
      }
      this._printedServices.push(pascalCase(name));
      fs.writeFile(
        path.resolve(process.cwd(),this.out + '/services/' + paramCase(name) + '.service.ts'),
        str,
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
  });
  }

  public printInternals(): void{
    const template = this.getTemplate('internal');
    if(template === ''){return}
    ejs.renderFile(template, {}, {}, (err:any, str:any)=>{
      if(err){
        this._logger.err(`[ ERROR ] EJS print INTERNALS error: ${err}`);
        return;
      }
      fs.writeFile(path.resolve(process.cwd(),this.out + '/internals.ts'), str, (err) => {
        if (err) {
          this._logger.err('[ ERROR ] file: ' + this.out + '/internals.ts');
          return;
        }
        this._logger.ok('[ OK    ] file: ' + this.out + '/internals.ts');
      });
    });
  }

  public printModule(): void {
    const template = this.getTemplate('module');
    if(template === ''){return}
    ejs.renderFile(template, {
      servicesList: this._printedServices.map(x=> x+'ApiService')
    }, {}, (err:any, str:any)=>{
      if(err){
        this._logger.err(`[ ERROR ] EJS print MODULE error: ${err}`);
        return;
      }
      fs.writeFile(path.resolve(process.cwd(),this.out + '/api.module.ts'), str, (err) => {
        if (err) {
          this._logger.err('[ ERROR ] file: ' + this.out + '/api.module.ts');
          return;
        }
        this._logger.ok('[ OK    ] file: ' + this.out + '/api.module.ts');
      });
    });
  }
  public printIndex(noModule: boolean): void {
    const imports = `export * from './services';
export * from './models';
${noModule?"": "export { APIModule } from './api.module';"}
`;
    try {
      fs.writeFileSync(path.resolve(process.cwd(),this.out + '/index.ts'), imports);
    } catch (e) {
      this._logger.err('[ ERROR ] file: ' + this.out + '/index.ts');
    }
  }
  public printServiceIndex(): void {
    const imports = [];
    for (const item of this._printedServices) {
      imports.push(
        `export { ${pascalCase(item)}ApiService, I${pascalCase(item)}ApiService } from './${paramCase(
          item
        )}.service';`
      );
    }
    imports.push('');
    try {
      fs.writeFileSync(
        path.resolve(process.cwd(),this.out + '/services/index.ts'),
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
        path.resolve(process.cwd(),this.out + '/models/index.ts'),
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
        path.resolve(process.cwd(),this.out + '/models/enums/index.ts'),
        imports.join('\r\n')
      );
    } catch (e) {
      this._logger.err(
        '[ ERROR ] file: ' + this.out + '/models/enums/index.ts'
      );
    }
  }
  private getTemplate(type: string): string{
    let template = '';
    if(this._templateFolder && fs.existsSync(path.resolve(process.cwd(),this._templateFolder, `${type}.ejs`))) {
      template = path.resolve(process.cwd(),this._templateFolder, `${type}.ejs`);
    }else if(fs.existsSync(path.resolve(this._stdTemplateFolder,`${type}.ejs`))){
      template = path.resolve(this._stdTemplateFolder,`${type}.ejs`);
    }else if(fs.existsSync(path.resolve(this._singleFileTemplateFolrder,`${type}.ejs`))){
      template = path.resolve(this._singleFileTemplateFolrder,`${type}.ejs`);
    } else {
      this._logger.err('[ ERROR ] template: not found!');
      return '';
    }
    return template;
  }
}
