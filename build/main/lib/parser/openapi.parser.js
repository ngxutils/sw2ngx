"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenApiV3Parser = void 0;
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const tsyringe_1 = require("tsyringe");
const configuration_repository_1 = require("../configuration.repository");
const resolve_imports_fn_1 = require("./utils/resolve-imports.fn");
const resolve_method_fn_1 = require("./utils/resolve-method.fn");
const resolve_type_fn_1 = require("./utils/resolve-type.fn");
let OpenApiV3Parser = class OpenApiV3Parser {
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
        return this.parseModels(config).pipe(operators_1.switchMap((models) => this.parseServices(config, models)));
    }
    parseModels(config) {
        var _a;
        const modelsDefs = {
            models: [],
            enums: [],
        };
        if ((_a = config === null || config === void 0 ? void 0 : config.components) === null || _a === void 0 ? void 0 : _a.schemas) {
            modelsDefs.models = Object.entries(config.components.schemas)
                .map(([name, definition]) => {
                var _a, _b, _c, _d, _e;
                let isArray = false;
                const parserFn = (_b = (_a = this.parserConfig) === null || _a === void 0 ? void 0 : _a.config.value) === null || _b === void 0 ? void 0 : _b.parserModelName;
                const modelName = `${parserFn(name) || name}`;
                if (definition.enum) {
                    resolve_type_fn_1.resolveTypeFn(definition, modelName, '', (_c = this.parserConfig) === null || _c === void 0 ? void 0 : _c.config.value);
                    return null;
                }
                let modelProperties = (definition === null || definition === void 0 ? void 0 : definition.properties)
                    ? Object.entries(definition.properties)
                    : [];
                if (definition.type === 'array') {
                    modelProperties = ((_d = definition === null || definition === void 0 ? void 0 : definition.items) === null || _d === void 0 ? void 0 : _d.properties)
                        ? Object.entries(((_e = definition === null || definition === void 0 ? void 0 : definition.items) === null || _e === void 0 ? void 0 : _e.properties) || {})
                        : [];
                    isArray = true;
                }
                const parsedProperties = modelProperties.map(([propName, propDef]) => {
                    var _a;
                    let isRequired = false;
                    if (Array.isArray(definition.required)) {
                        isRequired =
                            (((_a = definition === null || definition === void 0 ? void 0 : definition.required) === null || _a === void 0 ? void 0 : _a.filter((name) => name === propName)) ||
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
                    imports: resolve_imports_fn_1.resolveImportsFn(parsedProperties.reduce((acc, parsedProperty) => {
                        acc.push(...parsedProperty.propertyImport);
                        return acc;
                    }, [])),
                    properties: parsedProperties,
                    isArray: isArray,
                };
                return resolvedModel;
            })
                .filter((model) => !!model);
            modelsDefs.enums = resolve_type_fn_1.exportEnumRegistry();
        }
        return rxjs_1.of(modelsDefs);
    }
    parseModelProp(modelName, propName, prop, isRequired) {
        var _a;
        const resolvedProperty = resolve_type_fn_1.resolveTypeFn(prop, propName, modelName, (_a = this.parserConfig) === null || _a === void 0 ? void 0 : _a.config.value);
        return {
            propertyDescription: prop.description,
            propertyName: propName,
            propertyImport: resolvedProperty.typeImport,
            propertyType: resolvedProperty.type,
            propertyRequired: isRequired,
        };
    }
    parseServices(config, modelsAndEnums) {
        var _a, _b, _c, _d, _e;
        let services = [];
        const server = (_b = (_a = config === null || config === void 0 ? void 0 : config.servers) === null || _a === void 0 ? void 0 : _a.pop()) === null || _b === void 0 ? void 0 : _b.url;
        const uri = ((_e = (_d = (_c = this.parserConfig) === null || _c === void 0 ? void 0 : _c.config) === null || _d === void 0 ? void 0 : _d.value) === null || _e === void 0 ? void 0 : _e.baseHref) || server || config.basePath;
        if (config.paths) {
            const servicesList = Object.entries(config.paths)
                .map(([servicePath, serviceDef]) => {
                return ['get', 'post', 'put', 'delete', 'head', 'options'].map((servicePathMethod) => {
                    var _a, _b, _c, _d, _e;
                    const serviceMethodDef = serviceDef[servicePathMethod];
                    const response = (_d = (_c = (_b = (_a = serviceMethodDef === null || serviceMethodDef === void 0 ? void 0 : serviceMethodDef.responses) === null || _a === void 0 ? void 0 : _a['200']) === null || _b === void 0 ? void 0 : _b['content']) === null || _c === void 0 ? void 0 : _c['application/json']) === null || _d === void 0 ? void 0 : _d['schema'];
                    return serviceMethodDef
                        ? resolve_method_fn_1.resolveMethodFn(servicePath, servicePathMethod, serviceMethodDef, response, (_e = this.parserConfig) === null || _e === void 0 ? void 0 : _e.config.value)
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
                service.imports = resolve_imports_fn_1.resolveImportsFn(allServiceImports);
                return service;
            });
        }
        return rxjs_1.of({
            models: [...modelsAndEnums.models],
            enums: resolve_type_fn_1.exportEnumRegistry(),
            services: Object.values(services),
        });
    }
};
OpenApiV3Parser = __decorate([
    tsyringe_1.singleton(),
    __metadata("design:paramtypes", [configuration_repository_1.ConfigurationRepository])
], OpenApiV3Parser);
exports.OpenApiV3Parser = OpenApiV3Parser;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3BlbmFwaS5wYXJzZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvbGliL3BhcnNlci9vcGVuYXBpLnBhcnNlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQSwrQkFBc0M7QUFDdEMsOENBQTJDO0FBQzNDLHVDQUFxQztBQUlyQywwRUFBc0U7QUFHdEUsbUVBQThEO0FBQzlELGlFQUF3RTtBQUN4RSw2REFBNEU7QUFHNUUsSUFBYSxlQUFlLEdBQTVCLE1BQWEsZUFBZTtJQUMxQixZQUFvQixZQUFzQztRQUF0QyxpQkFBWSxHQUFaLFlBQVksQ0FBMEI7SUFBRyxDQUFDO0lBQzlELElBQUksQ0FBQyxNQUE2QjtRQUNoQyxPQUFPLENBQ0osTUFBb0IsQ0FBQyxPQUFPLEtBQUssU0FBUztZQUMzQyxTQUFTLENBQUMsSUFBSSxDQUFFLE1BQW9CLENBQUMsT0FBTyxDQUFDLENBQzlDLENBQUM7SUFDSixDQUFDO0lBQ0QsUUFBUSxDQUFDLE1BQTZCO1FBQ3BDLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUMzQixDQUFDO0lBQ0QsS0FBSyxDQUFDLE1BQWlCO1FBQ3JCLE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQ2xDLHFCQUFTLENBQUMsQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQzFELENBQUM7SUFDSixDQUFDO0lBQ08sV0FBVyxDQUNqQixNQUFpQjs7UUFFakIsTUFBTSxVQUFVLEdBQW1EO1lBQ2pFLE1BQU0sRUFBRSxFQUFFO1lBQ1YsS0FBSyxFQUFFLEVBQUU7U0FDVixDQUFDO1FBRUYsSUFBSSxNQUFBLE1BQU0sYUFBTixNQUFNLHVCQUFOLE1BQU0sQ0FBRSxVQUFVLDBDQUFFLE9BQU8sRUFBRTtZQUMvQixVQUFVLENBQUMsTUFB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