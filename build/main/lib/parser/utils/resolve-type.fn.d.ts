import { NonBodyParameter, Schema } from '../../../types/swagger';
export declare function exportEnumRegistry(): Sw2NgxEnum[];
export declare function isSchemaMulti(p: Schema | NonBodyParameter): p is Schema;
export declare function resolveTypeFn(prop: Schema | NonBodyParameter, name: string, parentName: string, swConfig: Sw2NgxConfig): Sw2NgxResolvedType;
