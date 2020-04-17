import { IParserService, IParserMethod } from './../../interfaces/parser';
export class ServiceTemplate {
  public imports(imp: string[]): string {
    const imports = [];
    if (imp.length === 0) {
      return '';
    }
    imports.push(`import {`);
    for (const item of imp) {
      imports.push(`${item},`);
    }
    imports.push(`} from '../models';`);
    return imports.join('\r\n');
  }

  public methodDescription(method: IParserMethod): string {
    const temp = [];
    temp.push(`
    /**
     * @method
     * @name  ${method.name}
     * @description${method.description ? method.description.replace('\r\n', '') : ''}\r\n`
    );
    for (const param of method.params.all) {
      temp.push(`     * @param {${param.type.typeName}} ${param.name}\r\n`);
    }
    temp.push(`     */`);
    return temp.join('');

  }

  public methodParams(method: IParserMethod, isInterface: boolean): string {
    const temp = [];
    for (const param of method.params.all) {
      if (!isInterface) {
        if (param.default) {
          temp.push(`${param.name}: ${param.type.typeName} = '${param.default}'`);
        } else {
          temp.push(`${param.name}: ${param.type.typeName}` + (param.required ? '' : ' = null'));
        }
      } else {
        temp.push(`${param.name}${param.required ? '' : '?'}: ${param.type.typeName}`);
      }
    }
    if(isInterface){
      temp.push('customHeaders?: {[key:string]:string}');
    }else{
      temp.push('customHeaders: {[key:string]:string} = { }');
    }

    return temp.join(', ');
  }

  public methodBody(method: IParserMethod) {
    const temp = [];
    if (method.params.query.length > 0) {
      temp.push(`
        let paramString = '';`);
      let isFirst = true;
      for (const param of method.params.query) {
        temp.push(`
        if ((${param.name} !== undefined) && (${param.name} !== null)) {
            paramString += '${isFirst ? '' : '&'}${param.queryName}=' + encodeURIComponent(${param.name}${param.type.typeName === 'Date' ? '.toISOString()' : '.toString()'});
        }${param.required ? " else { throw new Error('Required param(" + param.name + ") not set!'); }" : ''}`);
        isFirst = false;
      }
      temp.push(`
        options.params = new HttpParams({fromString: paramString});`);
    }

    if ((method.type === 'post') || (method.type === 'put')) {

      if (method.params.form.length !== 0) {
        temp.push(`
        options.headers = new HttpHeaders( customHeaders );
        options.headers.delete('Content-Type');
        const form = new FormData();`);
        for (const param of method.params.form) {
          if (param.type.typeName === 'any') {
            temp.push(`
        form.append('${param.queryName}', ${param.name});`);
          } else {
            temp.push(`
        form.append('${param.queryName}', JSON.stringify(${param.name}));`);
          }
        }
        temp.push(`
        return this.http.${method.type}<${method.resp[0].typeName}>(this.uri + \`${method.uri}\`, form, options);`);
      } else {
        if (method.params.urlencoded.length !== 0) {
          temp.push(`
        let payload = '';
        options.headers = new HttpHeaders(Object.assign( customHeaders, {'Content-Type': 'application/x-www-form-urlencoded'}));`);
          let isFirst = true;
          for (const param of method.params.urlencoded) {
            temp.push(`
        if ((${param.name} !== undefined) && (${param.name} !== null)) {
            payload += '${isFirst ? '' : '&'}${param.queryName}=' + encodeURIComponent(${param.name}${param.type.typeName === 'Date' ? '.toISOString()' : '.toString()'});
        }${param.required ? " else { throw new Error('Required param(" + param.name + ") not set!'); }" : ''}`);
            isFirst = false;
          }
          temp.push(`
        return this.http.${method.type}<${method.resp[0].typeName}>(this.uri + \`${method.uri}\`, payload, options);`);
        } else {
          temp.push(`
        // tslint:disable-next-line:prefer-const
        let payload = {};
        options.headers = new HttpHeaders(Object.assign( customHeaders, {'Content-Type': 'application/json; charset=utf-8'}));`);
          if (method.params.payload.length > 1) {
            for (const param of method.params.payload) {
              temp.push(`
        payload['${param.queryName}'] = ${param.name};`);
            }
          } else {
            if (method.params.payload.length > 0) {
              temp.push(`
        payload = ${method.params.payload[0].name};`);
            }
          }
          temp.push(`
        return this.http.${method.type}<${method.resp[0].typeName}>(this.uri + \`${method.uri}\`, JSON.stringify(payload), options);`);
        }
      }
    }

    if ((method.type === 'get') || (method.type === 'delete')) {
      temp.push(`
        return this.http.${method.type}<${method.resp[0].typeName}>(this.uri + \`${method.uri}\`${method.params.query.length !== 0 ? ', options' : ''});`);
    }

    return temp.join('\r\n');
  }
  public body(methods: IParserMethod[]) {
    const interBody: string[] = [];
    const serviceBody: string[] = [];
    for (const method of methods) {
      interBody.push(`${this.methodDescription(method)}
    ${method.name}(${this.methodParams(method, true)}): Observable<${method.resp[0].typeName}>;`);
      serviceBody.push(`\tpublic ${method.name}(${this.methodParams(method, false)}): Observable<${method.resp[0].typeName}> {
        const options = {
            headers: new HttpHeaders( customHeaders ),
            params: new HttpParams()
        };
${this.methodBody(method)}
    }`);
    }
    return { interfaceBody: interBody.join('\r\n'), serviceBody: serviceBody.join('\r\n') }
  }
  public compile(value: IParserService, name: string): string {
    if (value.methods.length > 0) {
      const imports: string = this.imports(value.imports);
      const { interfaceBody, serviceBody } = this.body(value.methods);
      return `import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
${imports}
export interface I${name}APIService {
${interfaceBody}
}

@Injectable({ providedIn: 'root' })
export class ${name}APIService implements I${name}APIService {
  public serviceName: string;
  public uri: string;
  constructor(
    public http: HttpClient) {
    this.serviceName = '${name}API';
    this.uri = '${value.uri}';
  }
${serviceBody}
}\r\n`;
    } else {
      return '';
    }

  }
}