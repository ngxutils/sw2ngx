import { mergeDuplicateEnums, resolveEnumFn } from './resolve-enum.fn';
const enumRegistry = new Map();
export function exportEnumRegistry() {
    return [...enumRegistry.values()];
}
export function resolveTypeFn(prop, name, parentName, swConfig) {
    if (prop.$ref && typeof prop.$ref === 'string') {
        const typeName = swConfig.parserModelName(prop.$ref);
        return {
            type: `${typeName}`,
            typeImport: [`${typeName}`],
        };
    }
    if (prop.enum) {
        const resolvedEnum = resolveEnumFn(prop.description, prop.enum, prop.type, name, parentName);
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
        if (prop.type === 'boolean' ||
            prop.type === 'string' ||
            prop.type === 'number' ||
            prop.type === 'null') {
            return {
                type: prop.type === 'null' ? 'unknown' : prop.type,
                typeImport: [],
            };
        }
        else if (prop.type === 'integer') {
            return {
                type: 'number',
                typeImport: [],
            };
        }
        else if (prop.type === 'array') {
            if (Array.isArray(prop.items)) {
                const parsedTypes = prop.items.map((item) => resolveTypeFn(item, name, parentName, swConfig));
                return {
                    type: '(' + parsedTypes.map((t) => t.type).join('|') + ')[]',
                    typeImport: parsedTypes.reduce((acc, cur) => {
                        acc.push(...cur.typeImport);
                        return acc;
                    }, []),
                };
            }
            else if (prop.items) {
                const parsedType = resolveTypeFn(prop.items, name, parentName, swConfig);
                return {
                    type: parsedType.type + '[]',
                    typeImport: parsedType.typeImport,
                };
            }
            return {
                type: 'unknown[]',
                typeImport: [],
            };
        }
        else if (prop.type === 'object') {
            if (prop.properties) {
                const props = Object.entries(prop.properties).map(([propname, prop]) => {
                    return {
                        name: propname,
                        type: resolveTypeFn(prop, propname, '', swConfig)
                    };
                });
                return {
                    type: '{' + [props.map(x => `${x.name}: ${x.type.type}`)].join(',') + '}',
                    typeImport: props.reduce((acc, cur) => {
                        acc.push(...cur.type.typeImport);
                        return acc;
                    }, []),
                };
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzb2x2ZS10eXBlLmZuLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL2xpYi9wYXJzZXIvdXRpbHMvcmVzb2x2ZS10eXBlLmZuLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUVBLE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxhQUFhLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQUV2RSxNQUFNLFlBQVksR0FBRyxJQUFJLEdBQUcsRUFBc0IsQ0FBQztBQUVuRCxNQUFNLFVBQVUsa0JBQWtCO0lBQ2hDLE9BQU8sQ0FBQyxHQUFHLFlBQVksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDO0FBQ3BDLENBQUM7QUFFRCxNQUFNLFVBQVUsYUFBYSxDQUMzQixJQUErQixFQUMvQixJQUFZLEVBQ1osVUFBa0IsRUFDbEIsUUFBc0I7SUFFdEIsSUFBSSxJQUFJLENBQUMsSUFBSSxJQUFJLE9BQU8sSUFBSSxDQUFDLElBQUksS0FBSyxRQUFRLEVBQUU7UUFDOUMsTUFBTSxRQUFRLEdBQUcsUUFBUSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDckQsT0FBTztZQUNMLElBQUksRUFBRSxHQUFHLFFBQVEsRUFBRTtZQUNuQixVQUFVLEVBQUUsQ0FBQyxHQUFHLFFBQVEsRUFBRSxDQUFDO1NBQzVCLENBQUM7S0FDSDtJQUNELElBQUksSUFBSSxDQUFDLElBQUksRUFBRTtRQUNiLE1BQU0sWUFBWSxHQUFHLGFBQWEsQ0FDaEMsSUFBSSxDQUFDLFdBQVcsRUFDaEIsSUFBSSxDQUFDLElBQUksRUFDVCxJQUFJLENBQUMsSUFBSSxFQUNULElBQUksRUFDSixVQUFVLENBQ1gsQ0FBQztRQUNGLElBQUksWUFBWSxDQUFDLFdBQVcsRUFBRTtZQUM1QixPQUFPO2dCQUNMLElBQUksRUFBRSxZQUFZLENBQUMsSUFBSTtnQkFDdkIsVUFBVSxFQUFFLEVBQUU7YUFDZixDQUFDO1NBQ0g7UUFDRCxNQUFNLFFBQVEsR0FB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