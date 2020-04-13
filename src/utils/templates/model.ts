import { IParserModel } from './../../interfaces/parser';
export class ModelTemplate {

  public modelImports(modelImports: string[], name: string) {
    const imports = [];
    if (modelImports.length === 0) { return ''; }
    imports.push(`import {`);
    for (const item of modelImports) {
      if (item !== name) {
        imports.push(`${item},`);
      }
    }
    imports.push(`} from './';`);
    return imports.join('\r\n');

  }

  public body(value: any): { [key: string]: string } {
    const itemp: string[] = []
    const temp: string[] = [];
    for (const param of value) {
      if (param.description) {
        itemp.push(`/* ${param.description} */`);
      }
      itemp.push(`${param.name} : ${param.type};`);
      temp.push(`public ${param.name}: ${param.type};`);
    }
    return {
      iprop: itemp.join('\r\n\t'),
      prop: temp.join('\r\n\t')
    }
  }
  public compile(value: IParserModel) {
    const { iprop, prop } = this.body(value.props);
    return `
${this.modelImports(value.imports, value.name)}

export interface ${value.name} {
  ${iprop}
}
`;
  }
}
