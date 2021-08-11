declare type Sw2NgxConfig = {
  config: string;
  outputPath: string;
  baseHref: string;
  templates: string;
  readOnlyModels: boolean;
  provideIn: string;
  genServiceInterfaces: boolean;
  help: boolean;
  parsingError: boolean;
  preset: string;
  parserMethodName: (uri: string, type: string, id: string) => string;
  parserModelName: (name: string) => string;
  [key: string]: string | boolean | unknown;
};
