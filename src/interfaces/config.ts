export interface IGeneratorConfig {
  [key: string]: string | boolean;
  config: string;
  out: string;
  ext: string;
  templateFolder: string;
  readonlyModels: boolean;
  withoutModule: boolean;
  providedIn: 'root' | 'any' | 'none' | string;
  help: boolean;
}
