"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveTypeFn = exports.isSchemaMulti = exports.exportEnumRegistry = void 0;
const resolve_enum_fn_1 = require("./resolve-enum.fn");
const enumRegistry = new Map();
function exportEnumRegistry() {
    return [...enumRegistry.values()];
}
exports.exportEnumRegistry = exportEnumRegistry;
function isSchemaMulti(p) {
    return !!(p && ((p === null || p === void 0 ? void 0 : p.oneOf) || (p === null || p === void 0 ? void 0 : p.allOf) || (p === null || p === void 0 ? void 0 : p.anyOf)));
}
exports.isSchemaMulti = isSchemaMulti;
function resolveTypeFn(prop, name, parentName, swConfig) {
    if (prop.$ref && typeof prop.$ref === 'string') {
        const typeName = swConfig.parserModelName(prop.$ref);
        return {
            type: `${typeName}`,
            typeImport: [`${typeName}`],
        };
    }
    if (prop.enum) {
        const resolvedEnum = resolve_enum_fn_1.resolveEnumFn((prop["x-enumNames"] || []), // cast Names
        prop.description, prop.enum, prop.type, name, parentName);
        if (resolvedEnum.isPremitive) {
            return {
                type: resolvedEnum.name,
                typeImport: [],
            };
        }
        const enumType = resolve_enum_fn_1.mergeDuplicateEnums(enumRegistry, resolvedEnum);
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
        const items = [...(prop.allOf || []), ...((prop === null || prop === void 0 ? void 0 : prop.anyOf) || []), ...((prop === null || prop === void 0 ? void 0 : prop.oneOf) || [])];
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
exports.resolveTypeFn = resolveTypeFn;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzb2x2ZS10eXBlLmZuLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL2xpYi9wYXJzZXIvdXRpbHMvcmVzb2x2ZS10eXBlLmZuLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUVBLHVEQUF1RTtBQUV2RSxNQUFNLFlBQVksR0FBRyxJQUFJLEdBQUcsRUFBc0IsQ0FBQztBQUVuRCxTQUFnQixrQkFBa0I7SUFDaEMsT0FBTyxDQUFDLEdBQUcsWUFBWSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUM7QUFDcEMsQ0FBQztBQUZELGdEQUVDO0FBRUQsU0FBZ0IsYUFBYSxDQUFHLENBQTRCO0lBQzFELE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQSxDQUFDLGFBQUQsQ0FBQyx1QkFBRCxDQUFDLENBQUUsS0FBSyxNQUFJLENBQUMsYUFBRCxDQUFDLHVCQUFELENBQUMsQ0FBRSxLQUFLLENBQUEsS0FBSSxDQUFDLGFBQUQsQ0FBQyx1QkFBRCxDQUFDLENBQUUsS0FBSyxDQUFBLENBQUMsQ0FBQyxDQUFDO0FBQ3JELENBQUM7QUFGRCxzQ0FFQztBQUVELFNBQWdCLGFBQWEsQ0FDM0IsSUFBK0IsRUFDL0IsSUFBWSxFQUNaLFVBQWtCLEVBQ2xCLFFBQXNCO0lBRXRCLElBQUksSUFBSSxDQUFDLElBQUksSUFBSSxPQUFPLElBQUksQ0FBQyxJQUFJLEtBQUssUUFBUSxFQUFFO1FBQzlDLE1BQU0sUUFBUSxHQUFHLFFBQVEsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3JELE9BQU87WUFDTCxJQUFJLEVBQUUsR0FBRyxRQUFRLEVBQUU7WUFDbkIsVUFBVSxFQUFFLENBQUMsR0FBRyxRQUFRLEVBQUUsQ0FBQztTQUM1QixDQUFDO0tBQ0g7SUFDRCxJQUFJLElBQUksQ0FBQyxJQUFJLEVBQUU7UUFDYixNQUFNLFlBQVksR0FBRywrQkFBYSxDQUNoQyxDQUFDLElBQUks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