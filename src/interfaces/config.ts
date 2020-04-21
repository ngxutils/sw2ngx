export interface IGeneratorConfig {
  [key: string]: string | boolean;
  config: string;
  out: string;
  templateFolder: string;
  help: boolean;
}
