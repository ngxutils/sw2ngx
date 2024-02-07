var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { singleton } from 'tsyringe';
import { ConfigurationRepository } from '../configuration.repository';
import { resolveImportsFn } from './utils/resolve-imports.fn';
import { resolveMethodFn } from './utils/resolve-method.fn';
import { exportEnumRegistry, resolveTypeFn } from './utils/resolve-type.fn';
let OpenApiV3Parser = class OpenApiV3Parser {
    parserConfig;
    constructor(parserConfig) {
        this.parserConfig = parserConfig;
    }
    isV3(config) {
        return (config.openapi !== undefined &&
            /^3\.?/gi.test(config.openapi));
    }
    supports(config) {
        return this.isV3(config);
    }
    parse(config) {
        return this.parseModels(config).pipe(switchMap((models) => this.parseServices(config, models)));
    }
    parseModels(config) {
        const modelsDefs = {
            models: [],
            enums: [],
        };
        if (config?.components?.schemas) {
            modelsDefs.models = Object.entries(config.components.schemas)
                .map(([name, definition]) => {
                let isArray = false;
                const parserFn = this.parserConfig?.config.value?.parserModelName;
                const modelName = `${parserFn(name) || name}`;
                if (definition.enum) {
                    resolveTypeFn(definition, modelName, '', this.parserConfig?.config.value);
                    return null;
                }
                let modelProperties = definition?.properties
                    ? Object.entries(definition.properties)
                    : [];
                if (definition.type === 'array') {
                    modelProperties = definition?.items?.properties
                        ? Object.entries(definition?.items?.properties || {})
                        : [];
                    isArray = true;
                }
                const parsedProperties = modelProperties.map(([propName, propDef]) => {
                    let isRequired = false;
                    if (Array.isArray(definition.required)) {
                        isRequired =
                            (definition?.required?.filter((name) => name === propName) ||
                                []).length > 0 || false;
                    }
                    else if (typeof definition.required === 'string') {
                        isRequired = definition.required === propName;
                    }
                    return this.parseModelProp(modelName, propName, propDef, isRequired);
                });
                const resolvedModel = {
                    name: modelName,
                    description: definition.description || `Swagger model: ${modelName}`,
                    imports: resolveImportsFn(parsedProperties.reduce((acc, parsedProperty) => {
                        acc.push(...parsedProperty.propertyImport);
                        return acc;
                    }, [])),
                    properties: parsedProperties,
                    isArray: isArray,
                };
                return resolvedModel;
            })
                .filter((model) => !!model);
            modelsDefs.enums = exportEnumRegistry();
        }
        return of(modelsDefs);
    }
    parseModelProp(modelName, propName, prop, isRequired) {
        const resolvedProperty = resolveTypeFn(prop, propName, modelName, this.parserConfig?.config.value);
        return {
            propertyDescription: prop.description,
            propertyName: propName,
            propertyImport: resolvedProperty.typeImport,
            propertyType: resolvedProperty.type,
            propertyRequired: isRequired,
        };
    }
    parseServices(config, modelsAndEnums) {
        let services = [];
        const server = config?.servers?.pop()?.url;
        const uri = this.parserConfig?.config?.value?.baseHref || server || config.basePath;
        if (config.paths) {
            const servicesList = Object.entries(config.paths)
                .map(([servicePath, serviceDef]) => {
                return ['get', 'post', 'put', 'delete', 'head', 'options'].map((servicePathMethod) => {
                    const serviceMethodDef = serviceDef[servicePathMethod];
                    const response = serviceMethodDef?.responses?.['200']?.['content']?.['application/json']?.['schema'];
                    return serviceMethodDef
                        ? resolveMethodFn(servicePath, servicePathMethod, serviceMethodDef, response, this.parserConfig?.config.value)
                        : null;
                });
            })
                .reduce((acc, cur) => {
                acc.push(...cur);
                return acc;
            }, [])
                .filter((item) => !!item)
                .reduce((acc, cur) => {
                if (acc[cur.tag]) {
                    acc[cur.tag].methods.push(cur);
                }
                else {
                    acc[cur.tag] = {
                        name: cur.tag,
                        uri: `${uri}`,
                        methods: [cur],
                        imports: [],
                    };
                }
                return acc;
            }, {
                __common: {
                    name: '__common',
                    uri: `${uri}`,
                    imports: [],
                    methods: [],
                },
            });
            services = Object.values(servicesList)
                .map((service) => {
                const methodsNames = [];
                service.methods = service.methods.map((method) => {
                    const duplicates = methodsNames.filter((name) => name === method.name).length;
                    methodsNames.push(method.name);
                    if (duplicates > 0) {
                        method.name += duplicates;
                    }
                    return method;
                });
                return service;
            })
                .map((service) => {
                const allServiceImports = service.methods
                    .map((method) => {
                    return [
                        ...method.params.all.map((param) => param.type.typeImport),
                        ...method.resp.map((response) => response.typeImport),
                    ].reduce((acc, cur) => {
                        acc.push(...cur);
                        return acc;
                    }, []);
                })
                    .reduce((acc, cur) => {
                    acc.push(...cur);
                    return acc;
                }, [])
                    .filter((item) => !!item);
                service.imports = resolveImportsFn(allServiceImports);
                return service;
            });
        }
        return of({
            models: [...modelsAndEnums.models],
            enums: exportEnumRegistry(),
            services: Object.values(services),
        });
    }
};
OpenApiV3Parser = __decorate([
    singleton(),
    __metadata("design:paramtypes", [ConfigurationRepository])
], OpenApiV3Parser);
export { OpenApiV3Parser };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3BlbmFwaS5wYXJzZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvbGliL3BhcnNlci9vcGVuYXBpLnBhcnNlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFBQSxPQUFPLEVBQWMsRUFBRSxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBQ3RDLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUMzQyxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sVUFBVSxDQUFDO0FBSXJDLE9BQU8sRUFBRSx1QkFBdUIsRUFBRSxNQUFNLDZCQUE2QixDQUFDO0FBR3RFLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLDRCQUE0QixDQUFDO0FBQzlELE9BQU8sRUFBYyxlQUFlLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQztBQUN4RSxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsYUFBYSxFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFHNUUsSUFBYSxlQUFlLEdBQTVCLE1BQWEsZUFBZTtJQUNOO0lBQXBCLFlBQW9CLFlBQXNDO1FBQXRDLGlCQUFZLEdBQVosWUFBWSxDQUEwQjtJQUFHLENBQUM7SUFDOUQsSUFBSSxDQUFDLE1BQTZCO1FBQ2hDLE9BQU8sQ0FDSixNQUFvQixDQUFDLE9BQU8sS0FBSyxTQUFTO1lBQzNDLFNBQVMsQ0FBQyxJQUFJLENBQUUsTUFBb0IsQ0FBQyxPQUFPLENBQUMsQ0FDOUMsQ0FBQztJQUNKLENBQUM7SUFDRCxRQUFRLENBQUMsTUFBNkI7UUFDcEMsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQzNCLENBQUM7SUFDRCxLQUFLLENBQUMsTUFBaUI7UUFDckIsT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksQ0FDbEMsU0FBUyxDQUFDLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0s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