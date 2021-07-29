import { camelCase, pascalCase } from 'change-case';

import {
  BodyParameter,
  JsonReference,
  Operation,
  Parameter
} from '../../../types/swagger';

import { resolveTypeFn } from './resolve-type.fn';
export type MethodType = 'post'| 'put'| 'get'| 'delete' | 'head' | 'options'

export type Sw2NgxMethodNameParser = (uri: string, type: MethodType, id: string) => string


function clearName(name: string): string {
  const baseTypes = ['number', 'string', 'boolean', 'any', 'array'];
  let result = name.replace(/\.|-/gi, '');
  if (baseTypes.includes(result)) {
    result = result + 'Param';
  }
  return result;
}

function genMethodName(uri: string, type: string, id =  ''): string {
  if(id!==''){
    return id;
  }
  const tmp = pascalCase(uri.replace(/\//gi, '-').replace(/\{|\}|\$/gi, ''));
  switch (type.toLocaleLowerCase()) {
    case 'post':
      return 'send' + tmp;
    case 'delete':
      return 'delete' + tmp;
    case 'put':
      return 'update' + tmp;
    case 'get':
    default:
      return 'get' + tmp;
  }
}

function isParameter(param: Parameter | JsonReference): param is BodyParameter{
  return (param as Parameter)?.schema!==undefined
}
function isJsonRef(param: Parameter | JsonReference): param is JsonReference{
  return (param as JsonReference).$ref!==undefined
}


function resolveMethodParams(methodName: string, param:JsonReference| Parameter ): Sw2NgxMethodParam {
  const parsedParamName = pascalCase(((param as Parameter).name! as string).split('.').pop()|| '')
  const paramName = parsedParamName === ''?'parsingErrorUnknownParam': parsedParamName
  let paramType
  if(isJsonRef(param)) {
    const typeName = param.$ref.split('/').pop()
    paramType =  {
      type: `I${typeName}`,
      typeImport: [`I${typeName}`]
    }
  }else if(isParameter(param)){
    paramType = resolveTypeFn(param.schema, paramName, methodName)
  } else {
    paramType = resolveTypeFn(param, paramName, methodName)
  }
  return {
    name: clearName((param as Parameter).name!),
    queryName: paramName,
    description: (param as Parameter)?.descriprion?`${(param as Parameter)?.descriprion}`: '',
    required: !!(param as Parameter)?.required,
    type: paramType,
    in: (param as Parameter)?.in
  }
}


export function resolveMethodFn(path: string, methodType: MethodType, method: Operation, methodNameParser?: Sw2NgxMethodNameParser): Sw2NgxServiceMethod {
  const nameParser = methodNameParser? methodNameParser: genMethodName
  const name = camelCase(nameParser(path, methodType, method?.operationId?method.operationId: ''))

  const params = method.parameters?.map((param)=>{
  return resolveMethodParams(name, param)
  })
    .filter((x):x is Sw2NgxMethodParam=>!!x)
    .reduce((
      acc:{
        all: Sw2NgxMethodParam[],
        query: Sw2NgxMethodParam[],
        formData: Sw2NgxMethodParam[],
        body: Sw2NgxMethodParam[],
        path: Sw2NgxMethodParam[]
        header: Sw2NgxMethodParam[]},
      cur)=> {
      acc.all.push(cur)
      acc[cur.in as keyof typeof acc].push(cur)
      return acc
  }, {
    all:[],
    query: [],
    formData: [],
    body: [],
    path: [],
      header: [],
  }) || {
    all:[],
    query: [],
    formData: [],
    body: [],
    path: [],
    header: [],
  }
  return {
    uri: path.replace(/{/gi, '${'),
    type: methodType,
    tag: Array.isArray(method.tags)? method.tags.pop()|| '__common' : '__common',
    name: name,
    isFormDataUrlencoded: !!method.consumes?.find((contentType)=> contentType ==='application/x-www-form-urlencoded'),
    description: method.summary,
    params: params,
    resp: []
  }
}
