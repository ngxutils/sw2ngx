import { ISwaggerConfig, ISwaggerProperty, ISwaggerParam } from './../interfaces/swagger.interface';
import { Logger } from './logger';
import { IParserModel, IParserEnum, IParserService, IParserResolvedType, IParserServiceList, IParserParam } from '../interfaces/parser';
import { SimHash } from './simhash/simhash';
import { paramCase, camelCase, pascalCase } from 'change-case';

export class Parser {
    private _enums: IParserEnum[] = [];
    private _models: IParserModel[] = [];
    private _servicesList: IParserServiceList = {};
    private _logger: Logger = new Logger();
    private _simHash: SimHash = new SimHash();

    public parse(config: ISwaggerConfig): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            this._logger.info('start parsing');
            this.parseModels(config).then((res) => {
                this._logger.info('models parsed');
                this.parseServices(config).then((res) => {
                    this._logger.info('services parsed');
                    resolve([this._enums, this._models, this._servicesList]);
                }, (err) => {
                    this._logger.info('services error');
                    this.handleError(JSON.stringify(err));
                    reject(err);
                })
            }, (err) => {
                this._logger.err('[ ERROR ]: Parsing enums error!');
                this.handleError(JSON.stringify(err));
                reject(err);
            });
        });

    }

    public parseModels(config: ISwaggerConfig): Promise<[IParserEnum[], IParserModel[]]> {
        const models = config.definitions;
        return new Promise<[IParserEnum[], IParserModel[]]>((resolve, reject) => {
            for (const key in models) {
                const model = {
                    name: '',
                    description: '',
                    imports: [],
                    props: []
                } as IParserModel;
                if (models.hasOwnProperty(key)) {
                    const imports = [];
                    model.name = 'I'+key;
                    model.description = models[key].description;
                    for (const prop in models[key].properties) {
                        if (models[key].properties.hasOwnProperty(prop)) {
                            const temp = this.parseModelProp(prop, models[key].properties[prop], model.name);
                            imports.push(temp.imports);
                            model.props.push(temp);
                        }
                    }
                    model.imports = this.resolveImports(imports);
                }
                this._models.push(model);
            }
            resolve([this._enums, this._models]);
        });
    }

    public parseTags(tags: string[]) {
        if (tags.length >= 1) {
            return tags[0];
        } else {
            return '__common'
        }
    }

    public parseServices(config: ISwaggerConfig): Promise<IParserServiceList> {
        return new Promise<IParserServiceList>((resolve, reject) => {
            let result: IParserServiceList = {
                __common: {
                    uri: config.basePath,
                    imports: [],
                    methods: []
                }
            };
            for (let path in config.paths) {
                if (config.paths.hasOwnProperty(path)) {
                    for (let method in config.paths[path]) {
                        if (config.paths[path].hasOwnProperty(method)) {
                            this._logger.ok(path);
                            let parsedMethod = this.parseMethod(path, method, config.paths[path][method]);
                            if (result.hasOwnProperty(parsedMethod.tag)) {
                                result[parsedMethod.tag].methods.push(parsedMethod);
                            } else {
                                result[parsedMethod.tag] = {
                                    uri: config.basePath,
                                    imports: [],
                                    methods: [parsedMethod]
                                }
                            }
                        }
                    }
                }
            }
            this._servicesList = this.resolveServiceImports(result);
            resolve(this._servicesList);
        });
    }

    public parseMethod(uri: string, type: string, method: any) {

        try {
            const tag = this.parseParams(method.parameters, method.operationId);
        } catch (e) {
            console.error('params');
        }

        const tag = this.parseTags(method.tags);
        const params = this.parseParams(method.parameters, method.operationId);
        const resp = this.parseResponse(method.responses, method.operationId);
        return {
            uri: uri.replace(/\{/ig, '${'),
            type: type,
            tag: tag,
            name: method.operationId,
            description: method.summary,
            params: params,
            resp: resp
        }
    }

    public resolveServiceImports(servicesList: IParserServiceList) {
        for (let serv in servicesList) {
            if (servicesList.hasOwnProperty(serv)) {
                let imports = [];
                for (let method of servicesList[serv].methods) {
                    if (method.resp.length > 0) {
                        for (let item of method.resp) {
                            imports.push(item.typeImport);
                        }
                    }
                    for (let param of method.params.all) {
                        if (param.type.typeImport) {
                            imports.push(param.type.typeImport);
                        }
                    }
                }
                servicesList[serv].imports = this.resolveImports(imports);
            }
        }
        return servicesList;
    }

    public get models(): IParserModel[] {
        return this._models;
    }

    public get enums(): IParserEnum[] {
        return this._enums;
    }

    public get services(): IParserServiceList {
        return this._servicesList;
    }

    public parseParams(params: ISwaggerParam[], method: string) {
        const parsed = {
            all: [],
            uri: [],
            query: [],
            payload: [],
            form: [],
            urlencoded:[]
        } as {
                [key: string]: IParserParam[]
            };
        for (const param in params) {
            if (params.hasOwnProperty(param)) {
                let type = null;
                this._logger.info(JSON.stringify(params[param]));
                const paramName = this.resolveParamName(params[param].name);
                this._logger.info(paramName);
                if (params[param].schema) {
                    this._logger.ok('type1');
                    type = this.resolveType(params[param].schema as ISwaggerProperty, paramName, method);
                } else {
                    this._logger.ok('type2');
                    type = this.resolveType(params[param] as ISwaggerProperty, paramName, method);
                }


                let res = {
                    name: this.clearName(params[param].name),
                    queryName: paramName,
                    description: params[param].description ? params[param].description : '',
                    required: params[param].required ? true : false,
                    type: type
                } as IParserParam;

                if (params[param].in === 'path') {
                    parsed.uri.push(res);
                }
                if (params[param].in === 'query') {
                    parsed.query.push(res);
                }
                if (params[param].in === 'body') {
                    parsed.payload.push(res);
                }
                if (params[param].in === 'formData') {
                    parsed.form.push(res);
                }
                parsed.all.push(res);
            }
        }
        return parsed;
    }

    public clearName(name: string): string {
        const baseTypes = [
            'number', 'string', 'boolean', 'any', 'array'
        ];
        let result = name.replace(/\.|\-/ig, '');
        if (baseTypes.indexOf(result) !== -1) {
            result = result + 'Param';
        }
        return result;
    }
    public resolveParamName(name: string): string {
        this._logger.ok(name);
        let temp = name.split('.');
        if (temp.length > 1) {
            let result = temp.pop() as string;
            console.log(result);
            let tmpResult = result.split('');
            tmpResult[0] = tmpResult[0].toUpperCase();
            return tmpResult.join('');
        }
        return temp.pop() as any;
    }

    public parseResponse(responses: any, method: string): IParserResolvedType[] {
        if (responses['200']) {
            if (responses['200']['schema']) {
                let resolvedType: IParserResolvedType = { typeName: '', typeImport: '' } as IParserResolvedType;
                if (responses['200']['schema']['enum']) {
                    resolvedType.typeName = 'number';
                } else {
                    resolvedType = this.resolveType(responses['200']['schema'], 'response', method);
                }
                if (resolvedType.typeName === '') {
                    return [{
                        typeName: 'any',
                        typeImport: null
                    }];
                } else {
                    if (resolvedType.typeImport !== '') {
                        return [resolvedType];
                    } else {
                        return [{
                            typeName: resolvedType.typeName,
                            typeImport: null
                        }];
                    }
                }
            } else {
                return [{
                    typeName: 'any',
                    typeImport: null
                }];
            }
        } else {
            return [{
                typeName: 'any',
                typeImport: null
            }];
        }
    }

    public resolveImports(imports: any[]): any[] {
        const result = [];
        for (const imp of imports) {
            if (result.indexOf(imp) === -1) {
                if (imp !== null) {
                    result.push(imp);
                }
            }
        }
        return result;
    }

    public parseModelProp(name: string, prop: ISwaggerProperty, modelName: string) {
        const resolvedType = this.resolveType(prop, name, modelName);
        return {
            name: name,
            type: resolvedType.typeName,
            imports: resolvedType.typeImport,
            description: prop.description !== '' ? prop.description : ''
        }
    }

    public resolveType(prop: ISwaggerProperty, name: string, parent: string): IParserResolvedType {
        let curname = name.replace(/\.|\-/ig, '_');
        if (prop === undefined) {
            return {
                typeName: 'any',
                typeImport: null
            };
        }
        if ((!prop.enum) && (!prop.format)) {
            if (prop.$ref !== undefined) {
                const temp = prop.$ref.split('/');
                return {
                    typeName: 'I'+temp[temp.length - 1],
                    typeImport: 'I'+temp[temp.length - 1]
                };
            }
            if ((prop.type === 'boolean') ||
                (prop.type === 'string') ||
                (prop.type === 'number')) {
                return {
                    typeName: prop.type,
                    typeImport: null
                };
            }
            if (prop.type === 'array') {
                if (prop.items) {
                    const temp = this.resolveType(prop.items, curname, parent);
                    return {
                        typeName: temp.typeName + "[]",
                        typeImport: temp.typeImport
                    };
                }

            }
            if (prop.type === 'object') {
                return {
                    typeName: 'any',
                    typeImport: null
                };
            }
        } else {
            if (prop.enum !== undefined) {
                return this.resolveEnums(prop.description, prop.enum, name, parent);
            }
            if (prop.format) {
                const result = { typeName: '', typeImport: null };
                switch (prop.format) {
                    case 'date-time':
                    case 'date':
                        result.typeName = 'string';
                        break;
                    case 'int32':
                    case 'integer':
                    case 'float':
                    case 'double':
                    case 'int64':
                        result.typeName = 'number';
                        break;
                    case 'password':
                        result.typeName = 'string';
                        break;
                    default:
                        result.typeName = 'any';
                        break;
                }
                return result;
            }

        }
        return {
            typeName: 'any',
            typeImport: null
        };
    }

    public handleError(e: any) {
        this._logger.reset().fg('red').writeln(e).reset();
    }

    public resolveEnums(description: string, evalue: number[], curname: string, parent: string): IParserResolvedType {
        const hashName = this._simHash.hash(evalue.join('|'));
        // this._logger.ok(`${parent}_${curname}Set: ${hashName.toString(16)}`);
        // this._logger.err(hashName);
        const extact = this.extractEnums(description ? description : '', evalue, curname);
        //  this._logger.err(JSON.stringify({description, evalue, curname, parent}))

        if(extact === null){
            return {
                typeName: evalue.join(' | '),
                typeImport: null
            }
        }
        const withParentName = `${pascalCase(paramCase(parent).replace(/^i\-/ig,'')+'-'+paramCase(curname+'Set'))}`
        const propEnum: IParserEnum = {
            name: `${pascalCase(curname)}Set`,
            modelName: parent,
            value: extact,
            hash: hashName.toString(16)
        };

        const duplicate = this._enums.filter(x=> x.name.replace(/\d+$/ig,'')=== propEnum.name);
        const extDuplicate = this._enums.filter(x=> x.name.replace(/\d+$/ig,'')===withParentName);
        if(duplicate.length>0){
            const equals = duplicate.filter(x=> x.hash===propEnum.hash);
            if(equals.length>0){
                return {
                    typeName: equals[0].name,
                    typeImport: equals[0].name
                }
            }else{
                if(extDuplicate.length>0){
                    propEnum.name = `${withParentName}${duplicate.length}`
                }else{
                    propEnum.name = withParentName;
                }
                this._enums.push(propEnum);
                return {
                    typeName: propEnum.name,
                    typeImport: propEnum.name
                }
            }
        }else{
            this._enums.push(propEnum);
            return {
                typeName: propEnum.name,
                typeImport: propEnum.name
            }
        }
    }

    public extractEnums(description: string, propEnum: number[], name: string = 'enum') {
        const result = [];
        let indexOf = description.search(/\(\d/ig);
        if (indexOf !== -1) {
            description = description.substr(indexOf + 1).replace(')', '');
            let temp = description.split(',');
            for (let tmp of temp) {
                ;
                let key = tmp.split('=');
                result.push({
                    key: key[1],
                    val: parseInt(key[0], 10)
                });
            }
        } else {
            return null;
        }
        return result;
    }
}
