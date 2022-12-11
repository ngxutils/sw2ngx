import { FileSchema, Schema } from '../../../types/swagger';

import { resolveTypeFn } from './resolve-type.fn';

function isFileSchema(schema: Schema | FileSchema): schema is FileSchema {
  return schema.type === 'file';
}
function isSchema(schema: Schema | FileSchema): schema is Schema {
  return schema.type !== 'file';
}

export function resolveResponseFn(
  responseSchema: Schema | FileSchema | undefined,
  methodName: string,
  swConfig: Sw2NgxConfig
): Sw2NgxResolvedType[] {

  if (responseSchema) {
    let resolvedType: Sw2NgxResolvedType = {
      type: 'unknown',
      typeImport: [],
    };
    if (responseSchema['enum']) {
      resolvedType.type = 'number';
    } else if (isFileSchema(responseSchema)) {
      resolvedType = {
        type: 'Blob',
        typeImport: [],
      };
    } else if (isSchema(responseSchema)) {
      resolvedType = resolveTypeFn(
        responseSchema,
        'response',
        methodName,
        swConfig
      );
    }
    if (resolvedType.type === 'unknown') {
      return [
        {
          type: 'Record<string, unknown> | unknown',
          typeImport: [],
        },
      ];
    } else {
      return [resolvedType];
    }
  } else {
    return [
      {
        type: 'Record<string, unknown> | unknown',
        typeImport: [],
      },
    ];
  }
}
