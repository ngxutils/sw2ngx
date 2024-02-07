import { mergeDuplicateEnums, resolveEnumFn } from './resolve-enum.fn';
const enumRegistry = new Map();
export function exportEnumRegistry() {
    return [...enumRegistry.values()];
}
export function isSchemaMulti(p) {
    return !!(p && (p?.oneOf || p?.allOf || p?.anyOf));
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
        const resolvedEnum = resolveEnumFn((prop["x-enumNames"] || []), // cast Names
        prop.description, prop.enum, prop.type, name, parentName);
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
    else if (isSchemaMulti(prop)) {
        const items = [...(prop.allOf || []), ...(prop?.anyOf || []), ...(prop?.oneOf || [])];
        const unique = new Set();
        const resolve = items
            .map((item) => resolveTypeFn(item, name, parentName, swConfig))
            .map((item) => {
            if (unique.has(item.type)) {
                return {
                    type: '',
                    typeImport: []
                };
            }
            else {
                unique.add(item.type);
                return item;
            }
        }).filter((x) => x.type !== '')
            .reduce((acc, item) => {
            if (acc.type !== '') {
                acc.type = acc.type + `${prop.allOf ? ' & ' : ' | '}` + item.type;
            }
            else {
                acc.type = item.type;
            }
            acc.typeImport = [...acc.typeImport, ...item.typeImport];
            return acc;
        }, { type: '', typeImport: [] });
        return resolve;
    }
    return {
        type: 'Record<string, unknown> | unknown',
        typeImport: [],
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzb2x2ZS10eXBlLmZuLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL2xpYi9wYXJzZXIvdXRpbHMvcmVzb2x2ZS10eXBlLmZuLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUVBLE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxhQUFhLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQUV2RSxNQUFNLFlBQVksR0FBRyxJQUFJLEdBQUcsRUFBc0IsQ0FBQztBQUVuRCxNQUFNLFVBQVUsa0JBQWtCO0lBQ2hDLE9BQU8sQ0FBQyxHQUFHLFlBQVksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDO0FBQ3BDLENBQUM7QUFFRCxNQUFNLFVBQVUsYUFBYSxDQUFHLENBQTRCO0lBQzFELE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLEtBQUssSUFBSSxDQUFDLEVBQUUsS0FBSyxJQUFJLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO0FBQ3JELENBQUM7QUFFRCxNQUFNLFVBQVUsYUFBYSxDQUMzQixJQUErQixFQUMvQixJQUFZLEVBQ1osVUFBa0IsRUFDbEIsUUFBc0I7SUFFdEIsSUFBSSxJQUFJLENBQUMsSUFBSSxJQUFJLE9BQU8sSUFBSSxDQUFDLElBQUksS0FBSyxRQUFRLEVBQUU7UUFDOUMsTUFBTSxRQUFRLEdBQUcsUUFBUSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDckQsT0FBTztZQUNMLElBQUksRUFBRSxHQUFHLFFBQVEsRUFBRTtZQUNuQixVQUFVLEVBQUUsQ0FBQyxHQUFHLFFBQVEsRUFBRSxDQUFDO1NBQzVCLENBQUM7S0FDSDtJQUNELElBQUksSUFBSSxDQUFDLElBQUksRUFBRTtRQUNiLE1BQU0sWUFBWSxHQUFHLGFBQWEsQ0FDaEMsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUUsRUFBRSxDQUFhLEVBQUcsYUFBYTtRQUNyRCxJQUFJ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