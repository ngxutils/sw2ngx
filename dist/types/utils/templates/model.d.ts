import { IParserModel } from './../../interfaces/parser';
export declare class ModelTemplate {
    modelImports(modelImports: string[], name: string): string;
    body(value: any): {
        [key: string]: string;
    };
    compile(value: IParserModel): string;
}
