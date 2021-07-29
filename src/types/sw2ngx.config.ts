declare type Sw2NgxConfig = {
  config: string
  outputPath: string,
  baseHref: string,
  extendConfigPath: string,
  templates: string,
  readOnlyModels: boolean,
  noModule: boolean,
  provideIn: string,
  genServiceInterfaces: boolean,
  help: boolean,
  parsingError: boolean,
  preset: string,
  [key:string]: string | boolean,
}
