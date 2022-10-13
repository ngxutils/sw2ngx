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
exports.OpenApiV2Parser = void 0;
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const tsyringe_1 = require("tsyringe");
const configuration_repository_1 = require("../configuration.repository");
const resolve_imports_fn_1 = require("./utils/resolve-imports.fn");
const resolve_method_fn_1 = require("./utils/resolve-method.fn");
const resolve_type_fn_1 = require("./utils/resolve-type.fn");
let OpenApiV2Parser = class OpenApiV2Parser {
    constructor(parserConfig) {
        this.parserConfig = parserConfig;
    }
    isV2(config) {
        return (config.swagger !== undefined &&
            config.swagger === '2.0');
    }
    supports(config) {
        return this.isV2(config);
    }
    parse(config) {
        return this.parseModels(config).pipe(operators_1.switchMap((models) => this.parseServices(config, models)));
    }
    parseModels(config) {
        const modelsDefs = {
            models: [],
            enums: [],
        };
        if (config === null || config === void 0 ? void 0 : config.definitions) {
            modelsDefs.models = Object.entries(config.definitions).map(([name, definition]) => {
                const modelName = `${name}`;
                const modelProperties = (definition === null || definition === void 0 ? void 0 : definition.properties)
                    ? Object.entries(definition.properties)
                    : [];
                const parsedProperties = modelProperties.map(([propName, propDef]) => {
                    var _a;
                    const isRequired = (((_a = definition === null || definition === void 0 ? void 0 : definition.required) === null || _a === void 0 ? void 0 : _a.filter((name) => name === propName)) ||
                        []).length > 0 || false;
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
                };
                return resolvedModel;
            });
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
        var _a, _b, _c;
        let services = [];
        if (config.paths) {
            const servicesList = Object.entries(config.paths)
                .map(([servicePath, serviceDef]) => {
                return ['get', 'post', 'put', 'delete', 'head', 'options'].map((servicePathMethod) => {
                    var _a, _b, _c;
                    const serviceMethodDef = serviceDef[servicePathMethod];
                    const response = (_b = (_a = serviceMethodDef === null || serviceMethodDef === void 0 ? void 0 : serviceMethodDef.responses) === null || _a === void 0 ? void 0 : _a['200']) === null || _b === void 0 ? void 0 : _b['schema'];
                    return serviceMethodDef
                        ? resolve_method_fn_1.resolveMethodFn(servicePath, servicePathMethod, serviceMethodDef, response, (_c = this.parserConfig) === null || _c === void 0 ? void 0 : _c.config.value)
                        : null;
                });
            })
                .reduce((acc, cur) => {
                acc.push(...cur);
                return acc;
            }, [])
                .filter((item) => !!item)
                .reduce((acc, cur) => {
                var _a, _b, _c;
                if (acc[cur.tag]) {
                    acc[cur.tag].methods.push(cur);
                }
                else {
                    acc[cur.tag] = {
                        name: cur.tag,
                        uri: `${((_c = (_b = (_a = this.parserConfig) === null || _a === void 0 ? void 0 : _a.config) === null || _b === void 0 ? void 0 : _b.value) === null || _c === void 0 ? void 0 : _c.baseHref) || config.basePath}`,
                        methods: [cur],
                        imports: [],
                    };
                }
                return acc;
            }, {
                __common: {
                    name: '__common',
                    uri: `${((_c = (_b = (_a = this.parserConfig) === null || _a === void 0 ? void 0 : _a.config) === null || _b === void 0 ? void 0 : _b.value) === null || _c === void 0 ? void 0 : _c.baseHref) || config.basePath}`,
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
            enums: [...modelsAndEnums.enums],
            services: Object.values(services),
        });
    }
};
OpenApiV2Parser = __decorate([
    tsyringe_1.singleton(),
    __metadata("design:paramtypes", [configuration_repository_1.ConfigurationRepository])
], OpenApiV2Parser);
exports.OpenApiV2Parser = OpenApiV2Parser;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3dhZ2dlci5wYXJzZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvbGliL3BhcnNlci9zd2FnZ2VyLnBhcnNlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQSwrQkFBc0M7QUFDdEMsOENBQTJDO0FBQzNDLHVDQUFxQztBQUlyQywwRUFBc0U7QUFHdEUsbUVBQThEO0FBQzlELGlFQUF3RTtBQUN4RSw2REFBNEU7QUFHNUUsSUFBYSxlQUFlLEdBQTVCLE1BQWEsZUFBZTtJQUMxQixZQUFvQixZQUFzQztRQUF0QyxpQkFBWSxHQUFaLFlBQVksQ0FBMEI7SUFBRyxDQUFDO0lBRTlELElBQUksQ0FBQyxNQUE2QjtRQUNoQyxPQUFPLENBQ0osTUFBb0IsQ0FBQyxPQUFPLEtBQUssU0FBUztZQUMxQyxNQUFvQixDQUFDLE9BQU8sS0FBSyxLQUFLLENBQ3hDLENBQUM7SUFDSixDQUFDO0lBQ0QsUUFBUSxDQUFDLE1BQTZCO1FBQ3BDLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUMzQixDQUFDO0lBQ0QsS0FBSyxDQUFDLE1BQWlCO1FBQ3JCLE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQ2xDLHFCQUFTLENBQUMsQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQzFELENBQUM7SUFDSixDQUFDO0lBQ0QsV0FBVyxDQUNULE1BQWlCO1FBRWpCLE1BQU0sVUFBVSxHQUFtRDtZQUNqRSxNQUFNLEVBQUUsRUFBRTtZQUNWLEtBQUssRUFBRSxFQUFFO1NBQ1YsQ0FBQztRQUVGLElBQUksTUFBTSxhQUFOLE1BQU0sdUJBQU4sTUFBTSxDQUFFLFdBQVcsRUFBRTtZQUN2QixVQUFVLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUMsTUFBTSxD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