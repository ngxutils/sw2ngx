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
let OpenApiV2Parser = class OpenApiV2Parser {
    parserConfig;
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
        return this.parseModels(config).pipe(switchMap((models) => this.parseServices(config, models)));
    }
    parseModels(config) {
        const modelsDefs = {
            models: [],
            enums: [],
        };
        if (config?.definitions) {
            modelsDefs.models = Object.entries(config.definitions).map(([name, definition]) => {
                const modelName = `${name}`;
                const modelProperties = definition?.properties
                    ? Object.entries(definition.properties)
                    : [];
                const parsedProperties = modelProperties.map(([propName, propDef]) => {
                    const isRequired = (definition?.required?.filter((name) => name === propName) ||
                        []).length > 0 || false;
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
                };
                return resolvedModel;
            });
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
        if (config.paths) {
            const servicesList = Object.entries(config.paths)
                .map(([servicePath, serviceDef]) => {
                return ['get', 'post', 'put', 'delete', 'head', 'options'].map((servicePathMethod) => {
                    const serviceMethodDef = serviceDef[servicePathMethod];
                    const response = serviceMethodDef?.responses?.['200']?.['schema'];
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
                        uri: `${this.parserConfig?.config?.value?.baseHref || config.basePath}`,
                        methods: [cur],
                        imports: [],
                    };
                }
                return acc;
            }, {
                __common: {
                    name: '__common',
                    uri: `${this.parserConfig?.config?.value?.baseHref || config.basePath}`,
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
OpenApiV2Parser = __decorate([
    singleton(),
    __metadata("design:paramtypes", [ConfigurationRepository])
], OpenApiV2Parser);
export { OpenApiV2Parser };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3dhZ2dlci5wYXJzZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvbGliL3BhcnNlci9zd2FnZ2VyLnBhcnNlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFBQSxPQUFPLEVBQWMsRUFBRSxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBQ3RDLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUMzQyxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sVUFBVSxDQUFDO0FBSXJDLE9BQU8sRUFBRSx1QkFBdUIsRUFBRSxNQUFNLDZCQUE2QixDQUFDO0FBR3RFLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLDRCQUE0QixDQUFDO0FBQzlELE9BQU8sRUFBYyxlQUFlLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQztBQUN4RSxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsYUFBYSxFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFHNUUsSUFBYSxlQUFlLEdBQTVCLE1BQWEsZUFBZTtJQUNOO0lBQXBCLFlBQW9CLFlBQXNDO1FBQXRDLGlCQUFZLEdBQVosWUFBWSxDQUEwQjtJQUFHLENBQUM7SUFFOUQsSUFBSSxDQUFDLE1BQTZCO1FBQ2hDLE9BQU8sQ0FDSixNQUFvQixDQUFDLE9BQU8sS0FBSyxTQUFTO1lBQzFDLE1BQW9CLENBQUMsT0FBTyxLQUFLLEtBQUssQ0FDeEMsQ0FBQztJQUNKLENBQUM7SUFDRCxRQUFRLENBQUMsTUFBNkI7UUFDcEMsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQzNCLENBQUM7SUFDRCxLQUFLLENBQUMsTUFBaUI7UUFDckIsT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksQ0FDbEMsU0FBUyxDQUFDLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUMxRCxDQUFDO0lBQ0osQ0FBQztJQUNELFdBQVcsQ0FDVCxNQUFpQjtRQUVqQixNQUFNLFVBQVUsR0FBbUQ7WUFDakUsTUFBTSxFQUFFLEVBQUU7WUFDVixLQUFLLEVBQUUsRUFBRTtTQUNWLENBQUM7UUFFRixJQUFJLE1BQU0sRUFBRSxXQUFXLEVBQUU7WUFDdkIsVUFBVSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsQ0FBQyxHQUFHLENBQ3hELENBQUMsQ0FBQyxJQUFJLEVBQUUsVUFBVSxDQUFDLEVBQUUsRUFBRTtnQkFDckIsTUFBTSxTQUFTLEdBQUcsR0FBRyxJQUFJLEVBQUUsQ0FBQztnQkFDNUIsTUFBTSxlQUFlLEdBQUcsVUFBVSxFQUFFLFVBQVU7b0JBQzVDLENBQUMsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUM7b0JBQ3ZDLENBQUMsQ0FBQyxFQUFFLENBQUM7Z0JBQ1AsTUFBTSxnQkFBZ0IsR0FBRyxlQUFlLENBQUMsR0FBRyxDQUMxQyxDQUFDLENBQUMsUUFBUSxFQUFFLE9BQU8sQ0FBQyxFQUFFLEVBQUU7b0JBQ3RCLE1BQU0sVUFBVSxHQUNkLENBQ0UsVUFBVSxFQUFFLFFBQVEsRUFBRSxNQUFNLENBQUMsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLElBQUksS0FBSyxRQUFRLENBQUM7d0JBQ3pELEVBQUUsQ0FDSCxDQUFDLE1BQU0sR0FBRyxDQUFDLElBQUksS0FBSyxDQUFDO29CQUN4QixPQUFPLElBQUksQ0FBQyxjQUFjLENBQ3hCLFNBQVMsRUFDVCxRQUFRLEVBQ1IsT0FBTyxFQUNQLFVBQVUsQ0FDWCxDQUFDO2dCQUNKLENBQUMsQ0FDRixDQUFDO2dCQUVGLE1BQU0sYUFBYSxHQUFnQjtvQkFDakMsSUFBSSxFQUFFLFNBQVM7b0JBQ2YsV0FBVyxFQUNULFVBQVUsQ0FBQyxXQUFXLElBQUksa0JBQWtCLFNBQVMsRUFBRTtvQkFDekQsT0FBTyxFQUFFLGdCQUFnQixDQUN2QixnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFhLEVBQUUsY0FBYyxFQUFFLEVBQUU7d0JBQ3hELEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxjQUFjLENBQUMsY0FBYyxDQUFDLENBQUM7d0JBQzNDLE9BQU8sR0FBRyxDQUFDO29CQUNiLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FDUDtvQkFDRCxVQUFVLEVBQUUsZ0JBQWdCO2lCQUM3QixDQUFDO2dCQUNGLE9BQU8sYUFBYSxDQUFDO1lBQ3ZCLENBQUMsQ0FDRixDQUFDO1lBQ0YsVUFBVSxDQUFDLEtBQUssR0FBRyxrQkFBa0IsRUFBRSxDQUFDO1NBQ3pDO1FBQ0QsT0FBTyxFQUFFLENBQUMsVUFBVSxDQUFDLENBQUM7SUFDeEIsQ0FBQztJQUNELGNBQWMsQ0FDWixTQUFpQixFQUNqQixRQUFnQixFQUNoQixJQUFZLEVBQ1osVUFBbUI7UUFFbkIsTUFBTSxnQkFBZ0IsR0FBRyxhQUFhLENBQ3BDLElBQUksRUFDSixRQUFRLEVBQ1IsU0FBUyxFQUNULElBQUksQ0FBQyxZQUFZLEVBQUUsTUFBTSxDQUFDLEtBQXFCLENBQ2hELENBQUM7UUFDRixPQUFPO1lBQ0wsbUJBQW1CLEVBQUUsSUFBSSxDQUFDLFdBQVc7WUFDckMsWUFBWSxFQUFFLFFBQVE7WUFDdEIsY0FBYyxFQUFFLGdCQUFnQixDQUFDLFVBQVU7WUFDM0MsWUFBWSxFQUFFLGdCQUFnQixDQUFDLElBQUk7WUFDbkMsZ0JBQWdCLEVBQUUsVUFBVTtTQUM3QixDQUFDO0lBQ0osQ0FBQztJQUVELGFBQWEsQ0FDWCxNQUFpQixFQUNqQixjQUE4RDtRQUU5RCxJQUFJLFFBQVEsR0FBb0IsRUFBRSxDQUFDO1FBRW5DLElBQUksTUFBTSxDQUFDLEtBQUssRUFBRTtZQUNoQixNQUFNLFlBQVksR0FBRyxNQUFNLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUM7aUJBQzlDLEdBQUcsQ0FBQyxDQUFDLENBQUMsV0FBVyxFQUFFLFVBQVUsQ0FBQyxFQUFFLEVBQUU7Z0JBQ2pDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLFNBQVMsQ0FBQyxDQUFDLEdBQUcsQ0FDNUQsQ0FBQyxpQkFBaUIsRUFBRSxFQUFFO29CQUNwQixNQUFNLGdCQUFnQixHQUFjLFVBQVUsQ0FDNUMsaUJBQWlCLENBQ0wsQ0FBQztvQkFDZixNQUFNLFFBQVEsR0FBRyxnQkFBZ0IsRUFBRSxTQUFTLEVBQUUsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLFFBQVEsQ0FBQyxDQUFDO29CQUNsRSxPQUFPLGdCQUFnQjt3QkFDckIsQ0FBQyxDQUFDLGVBQWUsQ0FDYixXQUFXLEVBQ1gsaUJBQStCLEVBQy9CLGdCQUFnQixFQUNoQixRQUFRLEVBQ1IsSUFBSSxDQUFDLFlBQVksRUFBRSxNQUFNLENBQUMsS0FBcUIsQ0FDaEQ7d0JBQ0gsQ0FBQyxDQUFDLElBQUksQ0FBQztnQkFDWCxDQUFDLENBQ0YsQ0FBQztZQUNKLENBQUMsQ0FBQztpQkFDRCxNQUFNLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEVBQUU7Z0JBQ25CLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQztnQkFDakIsT0FBTyxHQUFHLENBQUM7WUFDYixDQUFDLEVBQUUsRUFBRSxDQUFDO2lCQUNMLE1BQU0sQ0FBQyxDQUFDLElBQUksRUFBK0IsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7aUJBQ3JELE1BQU0sQ0FDTCxDQUFDLEdBQXFDLEVBQUUsR0FBRyxFQUFFLEVBQUU7Z0JBQzdDLElBQUksR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRTtvQkFDaEIsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2lCQUNoQztxQkFBTTtvQkFDTCxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHO3dCQUNiLElBQUksRUFBRSxHQUFHLENBQUMsR0FBRzt3QkFDYixHQUFHLEVBQUUsR0FDSCxJQUFJLENBQUMsWUFBWSxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsUUFBUSxJQUFJLE1BQU0sQ0FBQyxRQUN2RCxFQUFFO3dCQUNGLE9BQU8sRUFBRSxDQUFDLEdBQUcsQ0FBQzt3QkFDZCxPQUFPLEVBQUUsRUFBRTtxQkFDWixDQUFDO2lCQUNIO2dCQUNELE9BQU8sR0FBRyxDQUFDO1lBQ2IsQ0FBQyxFQUNEO2dCQUNFLFFBQVEsRUFBRTtvQkFDUixJQUFJLEVBQUUsVUFBVTtvQkFDaEIsR0FBRyxFQUFFLEdBQ0gsSUFBSSxDQUFDLFlBQVksRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLFFBQVEsSUFBSSxNQUFNLENBQUMsUUFDdkQsRUFBRTtvQkFDRixPQUFPLEVBQUUsRUFBRTtvQkFDWCxPQUFPLEVBQUUsRUFBRTtpQkFDWjthQUNGLENBQ0YsQ0FBQztZQUNKLFFBQVEsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQztpQkFDbkMsR0FBRyxDQUFDLENBQUMsT0FBTyxFQUFFLEVBQUU7Z0JBQ2YsTUFBTSxZQUFZLEdBQWEsRUFBRSxDQUFDO2dCQUNsQyxPQUFPLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsTUFBTSxFQUFFLEVBQUU7b0JBQy9DLE1BQU0sVUFBVSxHQUFHLFlBQVksQ0FBQyxNQUFNLENBQ3BDLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxJQUFJLEtBQUssTUFBTSxDQUFDLElBQUksQ0FDL0IsQ0FBQyxNQUFNLENBQUM7b0JBQ1QsWUFBWSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7b0JBQy9CLElBQUksVUFBVSxHQUFHLENBQUMsRUFBRTt3QkFDbEIsTUFBTSxDQUFDLElBQUksSUFBSSxVQUFVLENBQUM7cUJBQzNCO29CQUNELE9BQU8sTUFBTSxDQUFDO2dCQUNoQixDQUFDLENBQUMsQ0FBQztnQkFDSCxPQUFPLE9BQU8sQ0FBQztZQUNqQixDQUFDLENBQUM7aUJBQ0QsR0FBRyxDQUFDLENBQUMsT0FBTyxFQUFFLEVBQUU7Z0JBQ2YsTUFBTSxpQkFBaUIsR0FBRyxPQUFPLENBQUMsT0FBTztxQkFDdEMsR0FBRyxDQUFDLENBQUMsTUFBTSxFQUFFLEVBQUU7b0JBQ2QsT0FBTzt3QkFDTCxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUM7d0JBQzFELEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUM7cUJBQ3RELENBQUMsTUFBTSxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxFQUFFO3dCQUNwQixHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUM7d0JBQ2pCLE9BQU8sR0FBRyxDQUFDO29CQUNiLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztnQkFDVCxDQUFDLENBQUM7cUJBQ0QsTUFBTSxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxFQUFFO29CQUNuQixHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUM7b0JBQ2pCLE9BQU8sR0FBRyxDQUFDO2dCQUNiLENBQUMsRUFBRSxFQUFFLENBQUM7cUJBQ0wsTUFBTSxDQUFDLENBQUMsSUFBSSxFQUFrQixFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUM1QyxPQUFPLENBQUMsT0FBTyxHQUFHLGdCQUFnQixDQUFDLGlCQUFpQixDQUFDLENBQUM7Z0JBQ3RELE9BQU8sT0FBTyxDQUFDO1lBQ2pCLENBQUMsQ0FBQyxDQUFDO1NBQ047UUFDRCxPQUFPLEVBQUUsQ0FBQztZQUNSLE1BQU0sRUFBRSxDQUFDLEdBQUcsY0FBYyxDQUFDLE1BQU0sQ0FBQztZQUNsQyxLQUFLLEVBQUUsa0JBQWtCLEVBQUU7WUFDM0IsUUFBUSxFQUFFLE1BQU0sQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDO1NBQ2xDLENBQUMsQ0FBQztJQUNMLENBQUM7Q0FDRixDQUFBO0FBNUxZLGVBQWU7SUFEM0IsU0FBUyxFQUFFO3FDQUV5Qix1QkFBdUI7R0FEL0MsZUFBZSxDQTRMM0I7U0E1TFksZUFBZSJ9