import { NonBodyParameter, Schema } from '../../../types/swagger';

import { mergeDuplicateEnums, resolveEnumFn } from './resolve-enum.fn';

const enumRegistry = new Map<string, Sw2NgxEnum>();

export function exportEnumRegistry(): Sw2NgxEnum[] {
  return [...enumRegistry.values()];
}

export function resolveTypeFn(
  prop: Schema | NonBodyParameter,
  name: string,
  parentName: string,
  swConfig: Sw2NgxConfig
): Sw2NgxResolvedType {
  if (prop.$ref && typeof prop.$ref === 'string') {
    const typeName = swConfig.parserModelName(prop.$ref);
    return {
      type: `${typeName}`,
      typeImport: [`${typeName}`],
    };
  }
  if (prop.enum) {
    const resolvedEnum = resolveEnumFn(
      (prop["x-enumNames"]||[]) as string[],  // cast Names
      prop.description,
      prop.enum,
      prop.type,
      name,
      parentName
    );
    if (resolvedEnum.isPremitive) {
      return {
        type: resolvedEnum.name,
        typeImport: [],
      };
    }
    const enumType = mergeDuplicateEnums(enumRegistry, resolvedEnum);
    return {
      type: enumType,
      typeImport: [enumType],
    };
  }
  if (prop.format) {
    const result = { type: '', typeImport: [] };
    switch (prop.format) {
      case 'date-time':
      case 'date':
        result.type = 'string';
        break;
      case 'int32':
      case 'integer':
      case 'float':
      case 'double':
      case 'int64':
        result.type = 'number';
        break;
      case 'password':
      case 'uuid':
      case 'email':
      case 'uri':
      case 'hostname':
      case 'ipv4':
      case 'ipv6':
        result.type = 'string';
        break;
      case 'binary':
        result.type = 'Blob';
        break;
      default:
        result.type = 'Record<string, unknown> | unknown';
        break;
    }
    return result;
  }
  if (prop.type) {
    if (
      prop.type === 'boolean' ||
      prop.type === 'string' ||
      prop.type === 'number' ||
      prop.type === 'null'
    ) {
      return {
        type: prop.type === 'null' ? 'unknown' : prop.type,
        typeImport: [],
      };
    } else if (prop.type === 'integer') {
      return {
        type: 'number',
        typeImport: [],
      };
    } else if (prop.type === 'array') {
      if (Array.isArray(prop.items)) {
        const parsedTypes = prop.items.map((item) =>
          resolveTypeFn(item, name, parentName, swConfig)
        );
        return {
          type: '(' + parsedTypes.map((t) => t.type).join('|') + ')[]',
          typeImport: parsedTypes.reduce((acc: string[], cur) => {
            acc.push(...cur.typeImport);
            return acc;
          }, []),
        };
      } else if (prop.items) {
        const parsedType = resolveTypeFn(
          prop.items,
          name,
          parentName,
          swConfig
        );
        return {
          type: parsedType.type + '[]',
          typeImport: parsedType.typeImport,
        };
      }
      return {
        type: 'unknown[]',
        typeImport: [],
      };
    } else if (prop.type === 'object') {
      if(prop.properties){
        const props = Object.entries(prop.properties).map(([propname, prop])=>{
          return {
            name: propname,
            type: resolveTypeFn(prop, propname, '', swConfig)
          }

          })
        return {
          type: '{' +[props.map(x=>`${x.name}: ${x.type.type}`)].join(',') + '}',
          typeImport: props.reduce((acc, cur)=>{
            acc.push(...cur.type.typeImport);
            return acc;
          },[] as string[]),
        }
      }

      return {
        type: 'Record<string, unknown> | unknown',
        typeImport: [],
      };
    }
  }

  return {
    type: 'Record<string, unknown> | unknown',
    typeImport: [],
  };
}
