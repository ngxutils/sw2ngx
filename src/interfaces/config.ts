export interface IGeneratorConfig {
  [key: string]: string | boolean;
  config: string;
  out: string;
  templateFolder: string;
  readonlyModels: boolean;
  withoutModule: boolean;
  help: boolean;
}
