declare type Sw2NgxApiDefinition = {
  enums: Sw2NgxEnum[];
  models: Sw2NgxModel[];
  services: Sw2NgxService[];
};

declare type Sw2NgxResolvedType = {
  type: string;
  typeImport: string[];
};

declare type Sw2NgxEnum = {
  name: string;
  value: {
    key: string;
    val: string | number;
  }[];
  modelName: string;
  hash: string;
  isPremitive: boolean;
};
declare type Sw2NgxModel = {
  name: string;
  description?: string;
  imports: string[];
  properties: Sw2NgxProperty[];
  isArray?: boolean;
};
declare type Sw2NgxService = {
  name: string;
  uri: string;
  imports: string[];
  methods: Sw2NgxServiceMethod[];
};
declare type Sw2NgxProperty = {
  propertyDescription?: string;
  propertyName: string;
  propertyImport: string[];
  propertyType: string;
  propertyRequired: boolean;
};

declare type Sw2NgxServiceMethod = {
  uri: string;
  type: string;
  tag: string;
  name: string;
  description?: string;
  isFormDataUrlencoded?: boolean;
  params: {
    all: Sw2NgxMethodParam[];
    query: Sw2NgxMethodParam[];
    formData: Sw2NgxMethodParam[];
    body: Sw2NgxMethodParam[];
    path: Sw2NgxMethodParam[];
  };
  resp: Sw2NgxResolvedType[];
};

declare type Sw2NgxMethodParam = {
  name: string;
  queryName: string;
  description?: string;
  required: boolean;
  type: Sw2NgxResolvedType;
  default?: string;
  in: 'body' | 'header' | 'formData' | 'query' | 'path' | undefined;
};
