export interface IGeneratorConfig {
    [key: string]: string | boolean;
    config: string;
    out: string;
    help: boolean;
}
