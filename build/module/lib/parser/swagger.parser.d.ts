import { Observable } from 'rxjs';
import { OpenApiV3 } from '../../types/openapi';
import { OpenApiV2, Schema } from '../../types/swagger';
import { ConfigurationRepository } from '../configuration.repository';
import { IOpenApiParserPlugin } from './open-api-parser.plugin';
export declare class OpenApiV2Parser implements IOpenApiParserPlugin {
    private parserConfig?;
    constructor(parserConfig?: ConfigurationRepository | undefined);
    isV2(config: OpenApiV3 | OpenApiV2): config is OpenApiV2;
    supports(config: OpenApiV2 | OpenApiV3): boolean;
    parse(config: OpenApiV2): Observable<Sw2NgxApiDefinition>;
    parseModels(config: OpenApiV2): Observable<{
        models: Sw2NgxModel[];
        enums: Sw2NgxEnum[];
    }>;
    parseModelProp(modelName: string, propName: string, prop: Schema, isRequired: boolean): Sw2NgxProperty;
    parseServices(config: OpenApiV2, modelsAndEnums: {
        enums: Sw2NgxEnum[];
        models: Sw2NgxModel[];
    }): Observable<Sw2NgxApiDefinition>;
}
