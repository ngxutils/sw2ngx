declare type Sw2NgxConfig = {
  config: string
  outputPath: string,
  baseHref: string,
  extendConfigPath: string,
  templates: string,
  readOnlyModels: string,
  noModule: boolean,
  provideIn: string,
  help: boolean,
  parsingError: boolean,
  preset: string,
  [key:string]: string | boolean,
}
