import path from 'path';

import { OpenApiV3Parser } from './openapi.parser';
import { OpenApiV2Parser } from './swagger.parser';

export const parserConfiguration = [
  {
    token: 'PARSER',
    useClass: OpenApiV2Parser,
  },
  {
    token: 'PARSER',
    useClass: OpenApiV3Parser,
  },
  {
    token: 'CLI_PARAM',
    useValue: {
      key: '-parser-custom-method-name',
      name: 'parserMethodName',
      description: 'file for parsing method name function',
      withoutValue: false,
      required: true,
      defaultValueFunction: () => {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const { methodNameParser } = require(path.resolve(
          __dirname,
          `./parser-functions/method-name.js`
        ));
        return methodNameParser;
      },
    },
  },
  {
    token: 'CLI_PARAM',
    useValue: {
      key: '-parser-custom-model-name',
      name: 'parserModelName',
      description: 'file for parsing model name function',
      withoutValue: false,
      required: true,
      defaultValueFunction: () => {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const { modelNameParser } = require(path.resolve(
          __dirname,
          `./parser-functions/model-name.js`
        ));
        return modelNameParser;
      },
    },
  },
];
