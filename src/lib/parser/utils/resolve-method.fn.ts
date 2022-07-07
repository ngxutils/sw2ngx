import { camelCase, pascalCase } from 'change-case';

import { Operation as OperationV3 } from '../../../types/openapi';
import {
  BodyParameter,
  FileSchema,
  JsonReference,
  Operation,
  Parameter,
  Schema,
} from '../../../types/swagger';

import { resolveResponseFn } from './resolve-response.fn';
import { resolveTypeFn } from './resolve-type.fn';
export type MethodType = 'post' | 'put' | 'get' | 'delete' | 'head' | 'options';

function clearName(name: string): string {
  const baseTypes = ['number', 'string', 'boolean', 'any', 'array'];
  let result = name.replace(/\.|-/gi, '');
  if (baseTypes.includes(result)) {
    result = result + 'Param';
  }
  return result;
}

function isParameter(param: Parameter | JsonReference): param is BodyParameter {
  return (param as Parameter)?.schema !== undefined;
}
function isJsonRef(param: Parameter | JsonReference): param is JsonReference {
  return (param as JsonReference).$ref !== undefined;
}

function resolveMethodParams(
  methodName: string,
  param: JsonReference | Parameter,
  swConfig: Sw2NgxConfig
): Sw2NgxMethodParam {
  const paramNameArr = ((param as Parameter).name! as string).split('.');
  const parsedParamName =
    paramNameArr.length > 1
      ? pascalCase(paramNameArr.pop() || '')
      : paramNameArr.pop() || '';
  const paramName =
    parsedParamName === '' ? 'parsingErrorUnknownParam' : parsedParamName;

  let paramType;
  if (isJsonRef(param)) {
    const typeName = swConfig.parserModelName(param.$ref);
    paramType = {
      type: `${typeName}`,
      typeImport: [`${typeName}`],
    };
  } else if (isParameter(param)) {
    paramType = resolveTypeFn(param.schema, paramName, methodName, swConfig);
  } else {
    paramType = resolveTypeFn(param, paramName, methodName, swConfig);
  }
  return {
    name: clearName((param as Parameter).name!),
    queryName: paramName,
    description: (param as Parameter)?.descriprion
      ? `${(param as Parameter)?.descriprion}`
      : '',
    required: !!(param as Parameter)?.required,
    type: paramType,
    in: (param as Parameter)?.in,
  };
}

export function resolveMethodFn(
  path: string,
  methodType: MethodType,
  method: Operation,
  methodResponse: Schema | FileSchema | undefined,
  swConfig: Sw2NgxConfig
): Sw2NgxServiceMethod {
  const nameParser = swConfig.parserMethodName;
  const name = camelCase(
    nameParser(path, methodType, method?.operationId ? method.operationId : '')
  );
  const params = method.parameters
    ?.map((param) => {
      return resolveMethodParams(name, param, swConfig);
    })
    .filter((x): x is Sw2NgxMethodParam => !!x)
    .reduce(
      (
        acc: {
          all: Sw2NgxMethodParam[];
          query: Sw2NgxMethodParam[];
          formData: Sw2NgxMethodParam[];
          body: Sw2NgxMethodParam[];
          path: Sw2NgxMethodParam[];
          header: Sw2NgxMethodParam[];
        },
        cur
      ) => {
        acc.all.push(cur);
        acc[cur.in as keyof typeof acc].push(cur);
        return acc;
      },
      {
        all: [],
        query: [],
        formData: [],
        body: [],
        path: [],
        header: [],
      }
    ) || {
    all: [],
    query: [],
    formData: [],
    body: [],
    path: [],
    header: [],
  };
  //TODO: decompose method for V3 parser
  const methodV3 = method as OperationV3;
  const bodyRequest: Schema = (
    methodV3.requestBody?.['content'] as {
      [key: string]: Schema;
    }
  )?.['application/json']['schema'] as Schema;
  if (bodyRequest) {
    //TODO: has properties  -  multipart/formdata
    const bodyParam: Sw2NgxMethodParam = {
      name: 'methodBody',
      queryName: 'methodBody',
      description: bodyRequest.description,
      required: true,
      type: resolveTypeFn(bodyRequest, 'methodBody', name, swConfig),
      in: 'body',
    };
    params.all.push(bodyParam);
    params.body.push(bodyParam);
  }
  return {
    uri: path.replace(/{/gi, '${'),
    type: methodType,
    tag: Array.isArray(method.tags)
      ? method.tags.pop() || '__common'
      : '__common',
    name: name,
    isFormDataUrlencoded: !!method.consumes?.find(
      (contentType) => contentType === 'application/x-www-form-urlencoded'
    ),
    description: method.summary,
    params: params,
    resp: resolveResponseFn(methodResponse, camelCase(name), swConfig),
  };
}
