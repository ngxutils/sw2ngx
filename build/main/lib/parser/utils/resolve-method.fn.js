"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveMethodFn = void 0;
const change_case_1 = require("change-case");
const resolve_response_fn_1 = require("./resolve-response.fn");
const resolve_type_fn_1 = require("./resolve-type.fn");
function clearName(name) {
    const baseTypes = ['number', 'string', 'boolean', 'any', 'array'];
    let result = name.replace(/\.|-/gi, '');
    if (baseTypes.includes(result)) {
        result = result + 'Param';
    }
    return result;
}
function isParameter(param) {
    var _a;
    return ((_a = param) === null || _a === void 0 ? void 0 : _a.schema) !== undefined;
}
function isJsonRef(param) {
    return param.$ref !== undefined;
}
function resolveMethodParams(methodName, param, swConfig) {
    var _a, _b, _c, _d;
    const paramNameArr = param.name.split('.');
    const parsedParamName = paramNameArr.length > 1
        ? change_case_1.pascalCase(paramNameArr.pop() || '')
        : paramNameArr.pop() || '';
    const paramName = parsedParamName === '' ? 'parsingErrorUnknownParam' : parsedParamName;
    let paramType;
    if (isJsonRef(param)) {
        const typeName = swConfig.parserModelName(param.$ref);
        paramType = {
            type: `${typeName}`,
            typeImport: [`${typeName}`],
        };
    }
    else if (isParameter(param)) {
        paramType = resolve_type_fn_1.resolveTypeFn(param.schema, paramName, methodName, swConfig);
    }
    else {
        paramType = resolve_type_fn_1.resolveTypeFn(param, paramName, methodName, swConfig);
    }
    return {
        name: clearName(param.name),
        queryName: paramName,
        description: ((_a = param) === null || _a === void 0 ? void 0 : _a.descriprion)
            ? `${(_b = param) === null || _b === void 0 ? void 0 : _b.descriprion}`
            : '',
        required: !!((_c = param) === null || _c === void 0 ? void 0 : _c.required),
        type: paramType,
        in: (_d = param) === null || _d === void 0 ? void 0 : _d.in,
    };
}
function resolveMethodFn(path, methodType, method, methodResponse, swConfig) {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    const nameParser = swConfig.parserMethodName;
    const name = change_case_1.camelCase(nameParser(path, methodType, (method === null || method === void 0 ? void 0 : method.operationId) ? method.operationId : ''));
    const params = ((_a = method.parameters) === null || _a === void 0 ? void 0 : _a.map((param) => {
        return resolveMethodParams(name, param, swConfig);
    }).filter((x) => !!x).reduce((acc, cur) => {
        acc.all.push(cur);
        acc[cur.in].push(cur);
        return acc;
    }, {
        all: [],
        query: [],
        formData: [],
        body: [],
        path: [],
        header: [],
    })) || {
        all: [],
        query: [],
        formData: [],
        body: [],
        path: [],
        header: [],
    };
    //TODO: decompose method for V3 parser
    const methodV3 = method;
    console.log(methodV3.requestBody);
    const bodyRequest = (_d = (_c = (_b = methodV3.requestBody) === null || _b === void 0 ? void 0 : _b['content']) === null || _c === void 0 ? void 0 : _c['application/json']) === null || _d === void 0 ? void 0 : _d['schema'];
    const formData = (_g = (_f = (_e = methodV3.requestBody) === null || _e === void 0 ? void 0 : _e['content']) === null || _f === void 0 ? void 0 : _f['multipart/form-data']) === null || _g === void 0 ? void 0 : _g['schema'];
    if (bodyRequest) {
        const bodyParam = {
            name: 'methodBody',
            queryName: 'methodBody',
            description: bodyRequest.description,
            required: true,
            type: resolve_type_fn_1.resolveTypeFn(bodyRequest, 'methodBody', name, swConfig),
            in: 'body',
        };
        params.all.push(bodyParam);
        params.body.push(bodyParam);
    }
    if (formData) {
        const formParam = {
            name: 'formData',
            queryName: 'formModel',
            description: formData.description,
            required: true,
            type: resolve_type_fn_1.resolveTypeFn(formData, 'formData', name, swConfig),
            in: 'formData',
        };
        params.all.push(formParam);
        params.formData.push(formParam);
    }
    return {
        uri: path.replace(/{/gi, '${'),
        type: methodType,
        tag: Array.isArray(method.tags)
            ? method.tags.pop() || '__common'
            : '__common',
        name: name,
        isFormDataUrlencoded: !!((_h = method.consumes) === null || _h === void 0 ? void 0 : _h.find((contentType) => contentType === 'application/x-www-form-urlencoded')),
        description: method.summary,
        params: Object.assign(Object.assign({}, params), { all: params.all.sort((a, b) => {
                if (a.required && b.required) {
                    return 0;
                }
                return a.required && !b.required ? -1 : 1;
            }) }),
        resp: resolve_response_fn_1.resolveResponseFn(methodResponse, change_case_1.camelCase(name), swConfig),
    };
}
exports.resolveMethodFn = resolveMethodFn;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzb2x2ZS1tZXRob2QuZm4uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvbGliL3BhcnNlci91dGlscy9yZXNvbHZlLW1ldGhvZC5mbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSw2Q0FBb0Q7QUFZcEQsK0RBQTBEO0FBQzFELHVEQUFrRDtBQUdsRCxTQUFTLFNBQVMsQ0FBQyxJQUFZO0lBQzdCLE1BQU0sU0FBUyxHQUFHLENBQUMsUUFBUSxFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQ2xFLElBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBQ3hDLElBQUksU0FBUyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsRUFBRTtRQUM5QixNQUFNLEdBQUcsTUFBTSxHQUFHLE9BQU8sQ0FBQztLQUMzQjtJQUNELE9BQU8sTUFBTSxDQUFDO0FBQ2hCLENBQUM7QUFFRCxTQUFTLFdBQVcsQ0FBQyxLQUFnQzs7SUFDbkQsT0FBTyxDQUFBLE1BQUMsS0FBbUIsMENBQUUsTUFBTSxNQUFLLFNBQVMsQ0FBQztBQUNwRCxDQUFDO0FBQ0QsU0FBUyxTQUFTLENBQUMsS0FBZ0M7SUFDakQsT0FBUSxLQUF1QixDQUFDLElBQUksS0FBSyxTQUFTLENBQUM7QUFDckQsQ0FBQztBQUVELFNBQVMsbUJBQW1CLENBQzFCLFVBQWtCLEVBQ2xCLEtBQWdDLEVBQ2hDLFFBQXNCOztJQUV0QixNQUFNLFlBQVksR0FBSyxLQUFtQixDQUFDLElBQWdCLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ3ZFLE1BQU0sZUFBZSxHQUNuQixZQUFZLENBQUMsTUFBTSxHQUFHLENBQUM7UUFDckIsQ0FBQyxDQUFDLHdCQUFVLENBQUMsWUFBWSxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsQ0FBQztRQUN0QyxDQUFDLENB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