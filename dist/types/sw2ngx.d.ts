import { ISwaggerConfig } from "./interfaces/swagger.interface";
import { IGeneratorConfig } from "./interfaces/config";
export default class Generator {
    config: IGeneratorConfig;
    swagger: ISwaggerConfig | null;
    private parser;
    private helper;
    private _logger;
    private _printer;
    constructor(config?: IGeneratorConfig | null);
    start(): void;
    private getConfig;
}
