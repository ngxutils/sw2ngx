import { Logger } from './logger';
import { IGeneratorConfig } from '../interfaces/config';
export declare class HelpCLI {
    logger: Logger;
    parseArgs(): IGeneratorConfig;
    printHelp(): void;
}
