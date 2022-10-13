import { Observable } from 'rxjs';
import { OpenApiV3 } from '../../types/openapi';
import { OpenApiV2 } from '../../types/swagger';
export interface IOpenApiParserPlugin {
    supports(config: OpenApiV2 | OpenApiV3): boolean;
    parse(config: OpenApiV2 | OpenApiV3): Observable<Sw2NgxApiDefinition>;
}
