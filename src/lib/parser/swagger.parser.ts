import { singleton } from 'tsyringe';

import { OpenApiV3 } from '../../types/openapi';
import { OpenApiV2 } from '../../types/swagger';

import { IOpenApiParserPlugin } from './open-api-parser.plugin';

@singleton()
export class OpenApiV2Parser implements IOpenApiParserPlugin{
  isV2(config: OpenApiV3 | OpenApiV2): config is OpenApiV2{
    return (config as OpenApiV2).swagger !== undefined && (config as OpenApiV2).swagger === '2.0'
  }
  supports(config: OpenApiV2 | OpenApiV3) {
    return this.isV2(config)
  }
  parse(config: OpenApiV2) {
    return config?true:true
  }
}
