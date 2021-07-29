import {
  NonBodyParameter,
  Schema
} from '../../../types/swagger';

import { mergeDuplicateEnums, resolveEnumFn } from './resolve-enum.fn';

const enumRegistry: Sw2NgxEnum[] = []

export function exportEnumRegistry(): Sw2NgxEnum[]{
  return enumRegistry
}

export function resolveTypeFn(prop: Schema | NonBodyParameter, name: string, parentName:string): Sw2NgxResolvedType {
  if(prop.$ref && typeof prop.$ref === 'string'){
    const typeName = prop.$ref.split('/').pop()
    return {
      type: `I${typeName}`,
      typeImport: [`I${typeName}`]
    }
  }
  if(prop.enum){
    const resolvedEnum = resolveEnumFn(prop.description, prop.enum , name, parentName)
    if(resolvedEnum.isPremitive){
      return {
        type: resolvedEnum.name,
        typeImport: []
      }
    }
    const enumType = mergeDuplicateEnums(enumRegistry, resolvedEnum)
    return {
      type: enumType,
      typeImport: [enumType]
    }
  }
  if(prop.format) {
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
        result.type = 'string';
        break;
      default:
        result.type = 'Record<string, unknown> | unknown';
        break;
    }
    return result
  }
  if(prop.type){
    if (
      prop.type === 'boolean' ||
      prop.type === 'string' ||
      prop.type === 'number' ||
      prop.type === 'null'
    ) {
      return {
        type: prop.type === 'null'? 'unknown': prop.type,
        typeImport: []
      };
    } else if(
      prop.type ==='integer'
    ){
      return {
        type: 'number',
        typeImport: []
      }
    } else  if(prop.type === 'array'){
        if(Array.isArray(prop.items)){
          const parsedTypes = prop.items.map((item)=> resolveTypeFn(item, name, parentName))
          return {
            type: '('+parsedTypes.map((t)=> t.type).join('|')+')[]',
            typeImport: parsedTypes.reduce((acc: string[],cur)=> {
              acc.push(...cur.typeImport)
              return acc
            }, [])
          }
        } else if(prop.items) {
          const parsedType = resolveTypeFn(prop.items, name, parentName)
          return {
            type: parsedType.type,
            typeImport: parsedType.typeImport
          }
        }
        return {
          type: 'unknown[]',
          typeImport: []
        }
    } else if (prop.type === 'object'){
      return {
        type: 'Record<string, unknown> | unknown',
        typeImport: []
      }
    }
  }

  return {
    type: 'Record<string|unknown> | unknown',
    typeImport: []
  }
}
