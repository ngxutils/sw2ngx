import { IParserEnum, IParserServiceList, IParserModel, IParserService } from './../interfaces/parser';
export declare class TemplatePrinter {
    private out;
    private _printedServices;
    private _logger;
    private _templateFolder;
    private _stdTemplateFolder;
    private _singleFileTemplateFolrder;
    createFolders(): Promise<any>;
    print(enums: IParserEnum[], models: IParserModel[], services: IParserServiceList, out: string, templateFolder: string): Promise<any>;
    printEnum(value: IParserEnum): void;
    printModel(model: IParserModel): void;
    printService(service: IParserService, name: string): void;
    printModule(): void;
    printIndex(): void;
    printServiceIndex(): void;
    printModelIndex(models: IParserModel[]): void;
    printEnumIndex(enums: IParserEnum[]): void;
    private getTemplate;
}
