import { singleton } from 'tsyringe';

import { OpenApiV3 } from '../../types/openapi';
import { OpenApiV2 } from '../../types/swagger';

import { IOpenApiParserPlugin } from './open-api-parser.plugin';

@singleton()
export class OpenApiV3Parser implements IOpenApiParserPlugin{
  isV3(config: OpenApiV3 | OpenApiV2): config is OpenApiV3{
    return (config as OpenApiV3).openapi !== undefined && /^3\.?/ig.test((config as OpenApiV3).openapi)
  }
  supports(config: OpenApiV2 | OpenApiV3) {
    return this.isV3(config)
  }
  parse(config: OpenApiV3) {
    return config?true:true
  }
}
