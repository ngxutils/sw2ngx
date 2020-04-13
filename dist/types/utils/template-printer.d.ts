import { IParserEnum, IParserServiceList, IParserModel, IParserService } from './../interfaces/parser';
export declare class TemplatePrinter {
    private out;
    private enumCompiler;
    private modelCompiler;
    private serviceCompiler;
    private moduleCompiler;
    private _printedServices;
    private _logger;
    cleanFolder(): Promise<boolean>;
    createFolders(): Promise<{}>;
    print(enums: IParserEnum[], models: IParserModel[], services: IParserServiceList, out: string): Promise<any>;
    printEnum(value: IParserEnum): void;
    printModel(model: IParserModel): void;
    printService(service: IParserService, name: string): void;
    printModule(): void;
    printIndex(): void;
    printServiceIndex(): void;
    printModelIndex(models: IParserModel[]): void;
    printEnumIndex(enums: IParserEnum[]): void;
}
