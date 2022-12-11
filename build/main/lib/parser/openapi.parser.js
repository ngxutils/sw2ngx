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
                    var _a, _b, _c, _d;
                    const serviceMethodDef = serviceDef[servicePathMethod];
                    const response = (_c = (_b = (_a = serviceMethodDef === null || serviceMethodDef === void 0 ? void 0 : serviceMethodDef.responses) === null || _a === void 0 ? void 0 : _a['200']) === null || _b === void 0 ? void 0 : _b['content']) === null || _c === void 0 ? void 0 : _c['application/json']['schema'];
                    return serviceMethodDef
                        ? resolve_method_fn_1.resolveMethodFn(servicePath, servicePathMethod, serviceMethodDef, response, (_d = this.parserConfig) === null || _d === void 0 ? void 0 : _d.config.value)
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