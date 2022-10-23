import { Description } from '../../../types/swagger';
export declare function mergeDuplicateEnums(enumsMap: Map<string, Sw2NgxEnum>, insertEnum: Sw2NgxEnum): string;
export declare function resolveEnumFn(xEnum: string[], description: Description | undefined, enumValue: [unknown, ...unknown[]], propType: 'array' | 'boolean' | 'integer' | 'null' | 'number' | 'object' | 'string' | [
    ('array' | 'boolean' | 'integer' | 'null' | 'number' | 'object' | 'string'),
    ...('array' | 'boolean' | 'integer' | 'null' | 'number' | 'object' | 'string')[]
] | 'file' | undefined, currentName: string, modelName: string): Sw2NgxEnum;
