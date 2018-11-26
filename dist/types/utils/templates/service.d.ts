import { IParserService, IParserMethod } from './../../interfaces/parser';
export declare class ServiceTemplate {
    imports(imp: string[]): string;
    methodDescription(method: IParserMethod): string;
    methodParams(method: IParserMethod, isInterface: boolean): string;
    methodBody(method: IParserMethod): string;
    body(methods: IParserMethod[]): {
        interfaceBody: string;
        serviceBody: string;
    };
    compile(value: IParserService, name: string): string;
}
