import { ISwaggerConfig, ISwaggerProperty, ISwaggerParam } from './../interfaces/swagger.interface';
import { IParserModel, IParserEnum, IParserResolvedType, IParserServiceList, IParserParam, IParserMethod } from '../interfaces/parser';
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
    genMethodName(uri: string, type: string): string;
    parseMethod(uri: string, type: string, method: any): IParserMethod;
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
    extractEnumDescription(description: string): {
        key: string;
        val: number;
    }[] | null;
}
