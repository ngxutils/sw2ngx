import { Logger } from './logger';
export declare class CliHelper {
    private params;
    private logger?;
    constructor(params?: CliParam[], logger?: Logger | undefined);
    readCliParams(): Sw2NgxConfig;
    printHelp(): void;
    getCliParams(): Sw2NgxConfig;
}
