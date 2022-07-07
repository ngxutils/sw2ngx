import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { singleton } from 'tsyringe';

import { OpenApiV3, Operation as OperationV3 } from '../../types/openapi';
import { OpenApiV2, Operation, Schema } from '../../types/swagger';
import { ConfigurationRepository } from '../configuration.repository';

import { IOpenApiParserPlugin } from './open-api-parser.plugin';
import { resolveImportsFn } from './utils/resolve-imports.fn';
import { MethodType, resolveMethodFn } from './utils/resolve-method.fn';
import { exportEnumRegistry, resolveTypeFn } from './utils/resolve-type.fn';

@singleton()
export class OpenApiV3Parser implements IOpenApiParserPlugin {
  constructor(private parserConfig?: ConfigurationRepository) {}
  isV3(config: OpenApiV3 | OpenApiV2): config is OpenApiV3 {
    return (
      (config as OpenApiV3).openapi !== undefined &&
      /^3\.?/gi.test((config as OpenApiV3).openapi)
    );
  }
  supports(config: OpenApiV2 | OpenApiV3) {
    return this.isV3(config);
  }
  parse(config: OpenApiV3): Observable<Sw2NgxApiDefinition> {
    return this.parseModels(config).pipe(
      switchMap((models) => this.parseServices(config, models))
    );
  }
  private parseModels(
    config: OpenApiV3
  ): Observable<{ models: Sw2NgxModel[]; enums: Sw2NgxEnum[] }> {
    const modelsDefs: { models: Sw2NgxModel[]; enums: Sw2NgxEnum[] } = {
      models: [],
      enums: [],
    };

    if (config?.components?.schemas) {
      modelsDefs.models = Object.entries(config.components.schemas)
        .map(([name, definition]) => {
          let isArray = false;
          const parserFn = this.parserConfig?.config.value?.parserModelName as (
            name: string
          ) => string;
          const modelName = `${parserFn(name) || name}`;
          if (definition.enum) {
            resolveTypeFn(
              definition as unknown as Schema,
              modelName,
              '',
              this.parserConfig?.config.value as Sw2NgxConfig
            );
            return null;
          }
          let modelProperties = definition?.properties
            ? Object.entries(definition.properties)
            : [];
          if (definition.type === 'array') {
            modelProperties = (definition?.items as Schema)?.properties
              ? Object.entries((definition?.items as Schema)?.properties || {})
              : [];
            isArray = true;
          }
          const parsedProperties = modelProperties.map(
            ([propName, propDef]) => {
              let isRequired = false;
              if (Array.isArray(definition.required)) {
                isRequired =
                  (
                    definition?.required?.filter((name) => name === propName) ||
                    []
                  ).length > 0 || false;
              } else if (typeof definition.required === 'string') {
                isRequired = definition.required === propName;
              }

              return this.parseModelProp(
                modelName,
                propName,
                propDef,
                isRequired
              );
            }
          );

          const resolvedModel: Sw2NgxModel = {
            name: modelName,
            description:
              definition.description || `Swagger model: ${modelName}`,
            imports: resolveImportsFn(
              parsedProperties.reduce((acc: string[], parsedProperty) => {
                acc.push(...parsedProperty.propertyImport);
                return acc;
              }, [])
            ),
            properties: parsedProperties,
            isArray: isArray,
          };
          return resolvedModel;
        })
        .filter((model): model is Sw2NgxModel => !!model);
      modelsDefs.enums = exportEnumRegistry();
    }
    return of(modelsDefs);
  }
  parseModelProp(
    modelName: string,
    propName: string,
    prop: Schema,
    isRequired: boolean
  ): Sw2NgxProperty {
    const resolvedProperty = resolveTypeFn(
      prop,
      propName,
      modelName,
      this.parserConfig?.config.value as Sw2NgxConfig
    );
    return {
      propertyDescription: prop.description,
      propertyName: propName,
      propertyImport: resolvedProperty.typeImport,
      propertyType: resolvedProperty.type,
      propertyRequired: isRequired,
    };
  }

  parseServices(
    config: OpenApiV3,
    modelsAndEnums: { enums: Sw2NgxEnum[]; models: Sw2NgxModel[] }
  ): Observable<Sw2NgxApiDefinition> {
    let services: Sw2NgxService[] = [];

    if (config.paths) {
      const servicesList = Object.entries(config.paths)
        .map(([servicePath, serviceDef]) => {
          return ['get', 'post', 'put', 'delete', 'head', 'options'].map(
            (servicePathMethod) => {
              const serviceMethodDef: OperationV3 = serviceDef[
                servicePathMethod
              ] as OperationV3;
              const response = (
                serviceMethodDef?.responses?.['200']?.['content'] as {
                  [key: string]: Schema;
                }
              )?.['application/json']['schema'] as Schema;
              return serviceMethodDef
                ? resolveMethodFn(
                    servicePath,
                    servicePathMethod as MethodType,
                    serviceMethodDef as unknown as Operation,
                    response,
                    this.parserConfig?.config.value as Sw2NgxConfig
                  )
                : null;
            }
          );
        })
        .reduce((acc, cur) => {
          acc.push(...cur);
          return acc;
        }, [])
        .filter((item): item is Sw2NgxServiceMethod => !!item)
        .reduce(
          (acc: { [key: string]: Sw2NgxService }, cur) => {
            if (acc[cur.tag]) {
              acc[cur.tag].methods.push(cur);
            } else {
              acc[cur.tag] = {
                name: cur.tag,
                uri: `${
                  this.parserConfig?.config?.value?.baseHref || config.basePath
                }`,
                methods: [cur],
                imports: [],
              };
            }
            return acc;
          },
          {
            __common: {
              name: '__common',
              uri: `${
                this.parserConfig?.config?.value?.baseHref || config.basePath
              }`,
              imports: [],
              methods: [],
            },
          }
        );
      services = Object.values(servicesList)
        .map((service) => {
          const methodsNames: string[] = [];
          service.methods = service.methods.map((method) => {
            const duplicates = methodsNames.filter(
              (name) => name === method.name
            ).length;
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
            .filter((item): item is string => !!item);
          service.imports = resolveImportsFn(allServiceImports);
          return service;
        });
    }
    return of({
      models: [...modelsAndEnums.models],
      enums: [...modelsAndEnums.enums],
      services: Object.values(services),
    });
  }
}
