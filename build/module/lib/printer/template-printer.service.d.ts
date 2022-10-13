import { Observable } from 'rxjs';
import { ConfigurationRepository } from '../configuration.repository';
import { Logger } from '../logger';
export declare class TemplatePrinterService {
    private logger?;
    private sw2ngxConfiguration?;
    private get config();
    constructor(logger?: Logger | undefined, sw2ngxConfiguration?: ConfigurationRepository | undefined);
    print(apiDefinition: Sw2NgxApiDefinition): Observable<boolean>;
    private createGeneratorFolder;
    private printModelsStream;
    private printEnumsStream;
    private printServiceStream;
    private printInternals;
    private printIndex;
    private getTemplate;
    private renderEjsTemplate;
    private writeFileType;
}
