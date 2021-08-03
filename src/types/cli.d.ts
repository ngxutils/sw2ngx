declare type CliParam = {
  name: keyof Sw2NgxConfig | string;
  key: string;
  withoutValue: boolean;
  description: string;
  required: boolean;
  default?: string;
  defaultValueFunction?: () => string;
};
