import path from 'path';

import { OpenApiV3Parser } from './openapi.parser';
import { OpenApiV2Parser } from './swagger.parser';

export const parserConfiguration = [
  {
    token: "PARSER",
    useClass: OpenApiV2Parser
  },
  {
    token: "PARSER",
    useClass: OpenApiV3Parser
  },
  {
    token: 'CLI_PARAM',
    useValue: {
      key: "-parser-custom-service-name",
      name: "parserServiceName",
      description: "file for parsing service name function",
      withoutValue: false,
      required: false,
      defaultValueFunction: () => {
        return path.resolve(__dirname, `./parser-functions/service-name.js`)
      }
    }
  },
  {
    token: 'CLI_PARAM',
    useValue: {
      key: "-parser-custom-method-name",
      name: "parserMethodName",
      description: "file for parsing method name function",
      withoutValue: false,
      required: false,
      defaultValueFunction: () => {
        return path.resolve(__dirname, `./parser-functions/method-name.js`)
      }
    }
  },
  {
    token: 'CLI_PARAM',
    useValue: {
      key: "-parser-custom-param-name",
      name: "parserParamName",
      description: "file for parsing param name function",
      withoutValue: false,
      required: false,
      defaultValueFunction: () => {
        return path.resolve(__dirname, `./parser-functions/param-name.js`)
      }
    }
  },
  {
    token: 'CLI_PARAM',
    useValue: {
      key: "-parser-custom-enum-compare",
      name: "parserEnumCompare",
      description: "file for parsing enum compare function",
      withoutValue: false,
      required: false,
      default: '',
      defaultValueFunction: () => {
        return path.resolve(__dirname, `./parser-functions/enum-compare.js`)
      }
    }
  },
  {
    token: 'CLI_PARAM',
    useValue: {
      key: "-parser-custom-type-mapper",
      name: "parserTypeWrapper",
      description: "file for parsing type map function",
      withoutValue: false,
      required: false,
      default: '',
      defaultValueFunction: () => {
        return path.resolve(__dirname, `./parser-functions/type-map.js`)
      }
    }
  },
]
