import { CliHelper } from './cli.helper';
import { Sw2NgxConfigNormalizer } from './config-normalizer';
import { ConfigurationRepository } from './configuration.repository';
import { JsonConfigHelper } from './json-config.helper';
import { Logger } from './logger';
import { SwaggerConfigLoader } from './parser/config.loader';
import { IOpenApiParserPlugin } from './parser/open-api-parser.plugin';
import { TemplatePrinterService } from './printer/template-printer.service';
export declare class SwaggerToAngularCodeGen {
    private cliHelper?;
    private jsonConfigHelper?;
    private configNormalize?;
    private logger?;
    private configLoader?;
    private parsers?;
    private sw2ngxConfiguration?;
    private templatePrinter?;
    constructor(cliHelper?: CliHelper | undefined, jsonConfigHelper?: JsonConfigHelper | undefined, configNormalize?: Sw2NgxConfigNormalizer | undefined, logger?: Logger | undefined, configLoader?: SwaggerConfigLoader | undefined, parsers?: IOpenApiParserPlugin[] | undefined, sw2ngxConfiguration?: ConfigurationRepository | undefined, templatePrinter?: TemplatePrinterService | undefined);
    private run;
    private parseInput;
    private getConfig;
}
