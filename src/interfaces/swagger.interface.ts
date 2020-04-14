export interface ISwaggerConfig {
  basePath: string;
  definitions: ISwaggerDefinitions;
  paths: ISwaggerPaths;
}
export interface ISwaggerPaths {
  [key: string]: ISwaggerPath;
}
export interface ISwaggerDefinitions {
  [key: string]: ISwaggerDefinition;
}
export interface ISwaggerProperties {
  [key: string]: ISwaggerProperty;
}
export interface ISwaggerDefinition {
  description: string;
  type: string;
  properties: ISwaggerProperties;
}
export interface ISwaggerProperty {
  description: string;
  type: string;
  enum?: number[];
  format?: string;
  items?: ISwaggerProperty;
  $ref?: string;
}
export interface ISwaggerPath {
  [key: string]: ISwaggerPathProp;
}
export interface ISwaggerPathProp {
  tags: string[];
  summary: string;
  operationId: string;
  consumes: string[];
  produces: string[];
  responses: ISwaggerResponces;
  parameters: ISwaggerParam[];
}
export interface ISwaggerResponces {
  [key: string]: ISwaggerResponce;
}

export interface ISwaggerResponce {
  description: string;
  schema: ISwaggerSchema;
}

export interface ISwaggerSchema {
  type?: string;
  format?: string;
  items?: ISwaggerSchemaRef;
  $ref?: string;
  enum?: number[];
}
export interface ISwaggerSchemaRef {
  $ref: string;
}
export interface ISwaggerParam {
  name: string;
  in: string;
  description: string;
  required: boolean;
  type?: string;
  format?: string;
  enum?: number[];
  schema?: ISwaggerSchema;
}
