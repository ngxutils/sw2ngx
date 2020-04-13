import { ISwaggerConfig, ISwaggerProperty, ISwaggerParam } from './../interfaces/swagger.interface';
import { IParserModel, IParserEnum, IParserResolvedType, IParserServiceList, IParserParam } from '../interfaces/parser';
export declare class Parser {
    private _enums;
    private _models;
    private _servicesList;
    private _logger;
    private _simHash;
    parse(config: ISwaggerConfig): Promise<any>;
    parseModels(config: ISwaggerConfig): Promise<[IParserEnum[], IParserModel[]]>;
    parseTags(tags: string[]): string;
    parseServices(config: ISwaggerConfig): Promise<IParserServiceList>;
    parseMethod(uri: string, type: string, method: any): {
        uri: string;
        type: string;
        tag: string;
        name: string;
        description: any;
        params: {
            [key: string]: IParserParam[];
        };
        resp: IParserResolvedType[];
    };
    resolveServiceImports(servicesList: IParserServiceList): IParserServiceList;
    get models(): IParserModel[];
    get enums(): IParserEnum[];
    get services(): IParserServiceList;
    parseParams(params: ISwaggerParam[], method: string): {
        [key: string]: IParserParam[];
    };
    clearName(name: string): string;
    resolveParamName(name: string): string;
    parseResponse(responses: any, method: string): IParserResolvedType[];
    resolveImports(imports: any[]): any[];
    parseModelProp(name: string, prop: ISwaggerProperty, modelName: string): {
        name: string;
        type: string;
        imports: string | null;
        description: string;
    };
    resolveType(prop: ISwaggerProperty, name: string, parent: string): IParserResolvedType;
    handleError(e: any): void;
    resolveEnums(description: string, evalue: number[], curname: string, parent: string): IParserResolvedType;
    extractEnums(description: string, propEnum: number[], name?: string): {
        key: string;
        val: number;
    }[] | null;
}
