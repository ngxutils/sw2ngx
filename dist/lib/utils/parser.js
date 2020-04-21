"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var logger_1 = require("./logger");
var simhash_1 = require("./simhash/simhash");
var change_case_1 = require("change-case");
var Parser = /** @class */ (function () {
    function Parser() {
        this._enums = [];
        this._models = [];
        this._servicesList = {};
        this._logger = new logger_1.Logger();
        this._simHash = new simhash_1.SimHash();
    }
    Parser.prototype.parse = function (config) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this._logger.info('start parsing');
            _this.parseModels(config).then(function () {
                _this._logger.info('models parsed');
                _this.parseServices(config).then(function () {
                    _this._logger.info('services parsed');
                    resolve([_this._enums, _this._models, _this._servicesList]);
                }, function (err) {
                    _this._logger.info('services error');
                    _this.handleError(JSON.stringify(err));
                    reject(err);
                });
            }, function (err) {
                _this._logger.err('[ ERROR ]: Parsing enums error!');
                _this.handleError(JSON.stringify(err));
                reject(err);
            });
        });
    };
    Parser.prototype.parseModels = function (config) {
        var _this = this;
        var models = config.definitions;
        return new Promise(function (resolve) {
            for (var key in models) {
                var model = {
                    name: '',
                    description: '',
                    imports: [],
                    props: []
                };
                if (models[key]) {
                    var imports = [];
                    model.name = 'I' + key;
                    model.description = models[key].description;
                    for (var prop in models[key].properties) {
                        if (models[key].properties[prop]) {
                            var temp = _this.parseModelProp(prop, models[key].properties[prop], model.name);
                            imports.push(temp.imports);
                            model.props.push(temp);
                        }
                    }
                    model.imports = _this.resolveImports(imports);
                }
                _this._models.push(model);
            }
            resolve([_this._enums, _this._models]);
        });
    };
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    Parser.prototype.parseTags = function (tags) {
        if (tags.length >= 1) {
            return tags[0];
        }
        else {
            return '__common';
        }
    };
    Parser.prototype.parseServices = function (config) {
        var _this = this;
        return new Promise(function (resolve) {
            var result = {
                __common: {
                    uri: config.basePath,
                    imports: [],
                    methods: []
                }
            };
            for (var path in config.paths) {
                if (config.paths[path]) {
                    var _loop_1 = function (method) {
                        if (config.paths[path][method]) {
                            _this._logger.ok(path);
                            var parsedMethod_1 = _this.parseMethod(path, method, config.paths[path][method]);
                            if (result[parsedMethod_1.tag]) {
                                var duplicates = result[parsedMethod_1.tag].methods.filter(function (x) { return x.name.replace(/\d+$/gi, '') === parsedMethod_1.name; });
                                if (duplicates.length > 0) {
                                    parsedMethod_1.name = parsedMethod_1.name + duplicates.length;
                                }
                                result[parsedMethod_1.tag].methods.push(parsedMethod_1);
                            }
                            else {
                                result[parsedMethod_1.tag] = {
                                    uri: config.basePath,
                                    imports: [],
                                    methods: [parsedMethod_1]
                                };
                            }
                        }
                    };
                    for (var method in config.paths[path]) {
                        _loop_1(method);
                    }
                }
            }
            _this._servicesList = _this.resolveServiceImports(result);
            resolve(_this._servicesList);
        });
    };
    Parser.prototype.genMethodName = function (uri, type) {
        var tmp = change_case_1.pascalCase(uri.replace(/\//gi, '-').replace(/\{|\}|\$/gi, ''));
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
    };
    Parser.prototype.parseMethod = function (uri, type, method) {
        var name = method.operationId
            ? method.operationId
            : this.genMethodName(uri, type);
        var tag = this.parseTags(method.tags);
        var params = this.parseParams(method.parameters, change_case_1.camelCase(name));
        var resp = this.parseResponse(method.responses, change_case_1.camelCase(name));
        return {
            uri: uri.replace(/\{/gi, '${'),
            type: type,
            tag: tag,
            name: change_case_1.camelCase(name),
            description: method.summary,
            params: params,
            resp: resp
        };
    };
    Parser.prototype.resolveServiceImports = function (servicesList) {
        for (var serv in servicesList) {
            if (servicesList[serv]) {
                var imports = [];
                for (var _i = 0, _a = servicesList[serv].methods; _i < _a.length; _i++) {
                    var method = _a[_i];
                    if (method.resp.length > 0) {
                        for (var _b = 0, _c = method.resp; _b < _c.length; _b++) {
                            var item = _c[_b];
                            imports.push(item.typeImport);
                        }
                    }
                    for (var _d = 0, _e = method.params.all; _d < _e.length; _d++) {
                        var param = _e[_d];
                        if (param.type.typeImport) {
                            imports.push(param.type.typeImport);
                        }
                    }
                }
                servicesList[serv].imports = this.resolveImports(imports);
            }
        }
        return servicesList;
    };
    Object.defineProperty(Parser.prototype, "models", {
        get: function () {
            return this._models;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Parser.prototype, "enums", {
        get: function () {
            return this._enums;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Parser.prototype, "services", {
        get: function () {
            return this._servicesList;
        },
        enumerable: true,
        configurable: true
    });
    Parser.prototype.parseParams = function (params, method) {
        var parsed = {
            all: [],
            uri: [],
            query: [],
            payload: [],
            form: [],
            urlencoded: []
        };
        if (!params) {
            return parsed;
        }
        for (var _i = 0, params_1 = params; _i < params_1.length; _i++) {
            var param = params_1[_i];
            var type = null;
            var paramName = this.resolveParamName(param.name);
            if (param.schema) {
                type = this.resolveType(param.schema, paramName, method);
            }
            else {
                type = this.resolveType(param, paramName, method);
            }
            var res = {
                name: this.clearName(param.name),
                queryName: paramName,
                description: param.description ? param.description : '',
                required: param.required ? true : false,
                type: type
            };
            if (param.in === 'path') {
                parsed.uri.push(res);
            }
            if (param.in === 'query') {
                parsed.query.push(res);
            }
            if (param.in === 'body') {
                parsed.payload.push(res);
            }
            if (param.in === 'formData') {
                parsed.form.push(res);
            }
            parsed.all.push(res);
        }
        return parsed;
    };
    Parser.prototype.clearName = function (name) {
        var baseTypes = ['number', 'string', 'boolean', 'any', 'array'];
        var result = name.replace(/\.|-/gi, '');
        if (baseTypes.includes(result)) {
            result = result + 'Param';
        }
        return result;
    };
    Parser.prototype.resolveParamName = function (name) {
        this._logger.ok(name);
        var temp = name.split('.');
        if (temp.length > 1) {
            var result = temp.pop();
            console.log(result);
            var tmpResult = result.split('');
            tmpResult[0] = tmpResult[0].toUpperCase();
            return tmpResult.join('');
        }
        return temp.pop();
    };
    Parser.prototype.parseResponse = function (responses, method) {
        if (responses['200']) {
            if (responses['200']['schema']) {
                var resolvedType = {
                    typeName: '',
                    typeImport: ''
                };
                if (responses['200']['schema']['enum']) {
                    resolvedType.typeName = 'number';
                }
                else {
                    resolvedType = this.resolveType(responses['200']['schema'], 'response', method);
                }
                if (resolvedType.typeName === '') {
                    return [
                        {
                            typeName: 'any',
                            typeImport: null
                        }
                    ];
                }
                else {
                    if (resolvedType.typeImport !== '') {
                        return [resolvedType];
                    }
                    else {
                        return [
                            {
                                typeName: resolvedType.typeName,
                                typeImport: null
                            }
                        ];
                    }
                }
            }
            else {
                return [
                    {
                        typeName: 'any',
                        typeImport: null
                    }
                ];
            }
        }
        else {
            return [
                {
                    typeName: 'any',
                    typeImport: null
                }
            ];
        }
    };
    Parser.prototype.resolveImports = function (imports) {
        var result = [];
        for (var _i = 0, imports_1 = imports; _i < imports_1.length; _i++) {
            var imp = imports_1[_i];
            if (!result.includes(imp)) {
                if (imp !== null) {
                    result.push(imp);
                }
            }
        }
        return result;
    };
    Parser.prototype.parseModelProp = function (name, prop, modelName) {
        var resolvedType = this.resolveType(prop, name, modelName);
        return {
            name: name,
            type: resolvedType.typeName,
            imports: resolvedType.typeImport,
            description: prop.description !== '' ? prop.description : ''
        };
    };
    Parser.prototype.resolveType = function (prop, name, parent) {
        var curname = name.replace(/\.|-/gi, '_');
        if (prop === undefined) {
            return {
                typeName: 'any',
                typeImport: null
            };
        }
        if (!prop.enum && !prop.format) {
            if (prop.$ref !== undefined) {
                var temp = prop.$ref.split('/');
                return {
                    typeName: 'I' + temp[temp.length - 1],
                    typeImport: 'I' + temp[temp.length - 1]
                };
            }
            if (prop.type === 'boolean' ||
                prop.type === 'string' ||
                prop.type === 'number') {
                return {
                    typeName: prop.type,
                    typeImport: null
                };
            }
            if (prop.type === 'array') {
                if (prop.items) {
                    var temp = this.resolveType(prop.items, curname, parent);
                    return {
                        typeName: temp.typeName + '[]',
                        typeImport: temp.typeImport
                    };
                }
            }
            if (prop.type === 'object') {
                return {
                    typeName: 'any',
                    typeImport: null
                };
            }
        }
        else {
            if (prop.enum !== undefined) {
                return this.resolveEnums(prop.description, prop.enum, name, parent);
            }
            if (prop.format) {
                var result = { typeName: '', typeImport: null };
                switch (prop.format) {
                    case 'date-time':
                    case 'date':
                        result.typeName = 'string';
                        break;
                    case 'int32':
                    case 'integer':
                    case 'float':
                    case 'double':
                    case 'int64':
                        result.typeName = 'number';
                        break;
                    case 'password':
                        result.typeName = 'string';
                        break;
                    default:
                        result.typeName = 'any';
                        break;
                }
                return result;
            }
        }
        return {
            typeName: 'any',
            typeImport: null
        };
    };
    Parser.prototype.handleError = function (e) {
        this._logger.reset().fg('red').writeln(e).reset();
    };
    Parser.prototype.resolveEnums = function (description, evalue, curname, parent) {
        var hashName = this._simHash.hash(evalue.join('|'));
        // this._logger.ok(`${parent}_${curname}Set: ${hashName.toString(16)}`);
        // this._logger.err(hashName);
        var extact = this.extractEnumDescription(description ? description : '');
        //  this._logger.err(JSON.stringify({description, evalue, curname, parent}))
        if (extact === null) {
            var numbers_1 = '1234567890'.split('');
            if (evalue
                .join('')
                .split('')
                .filter(function (x) { return !numbers_1.includes(x); }).length > 0) {
                return {
                    typeName: '( ' + evalue.map(function (x) { return "'" + x + "'"; }).join(' | ') + ' )',
                    typeImport: null
                };
            }
            return {
                typeName: '( ' + evalue.join(' | ') + ' )',
                typeImport: null
            };
        }
        var withParentName = "" + change_case_1.pascalCase(change_case_1.paramCase(parent).replace(/^i-/gi, '') + '-' + change_case_1.paramCase(curname + 'Set'));
        var propEnum = {
            name: change_case_1.pascalCase(curname) + "Set",
            modelName: parent,
            value: extact,
            hash: hashName.toString(16)
        };
        var duplicate = this._enums.filter(function (x) { return x.name.replace(/\d+$/gi, '') === propEnum.name; });
        var extDuplicate = this._enums.filter(function (x) { return x.name.replace(/\d+$/gi, '') === withParentName; });
        if (duplicate.length > 0) {
            var equals = duplicate.filter(function (x) { return x.hash === propEnum.hash; });
            if (equals.length > 0) {
                return {
                    typeName: equals[0].name,
                    typeImport: equals[0].name
                };
            }
            else {
                if (extDuplicate.length > 0) {
                    propEnum.name = "" + withParentName + duplicate.length;
                }
                else {
                    propEnum.name = withParentName;
                }
                this._enums.push(propEnum);
                return {
                    typeName: propEnum.name,
                    typeImport: propEnum.name
                };
            }
        }
        else {
            this._enums.push(propEnum);
            return {
                typeName: propEnum.name,
                typeImport: propEnum.name
            };
        }
    };
    Parser.prototype.extractEnumDescription = function (description) {
        var result = [];
        var indexOf = description.search(/\(\d/gi);
        if (indexOf !== -1) {
            description = description.substr(indexOf + 1).replace(')', '');
            var temp = description.split(',');
            for (var _i = 0, temp_1 = temp; _i < temp_1.length; _i++) {
                var tmp = temp_1[_i];
                var key = tmp.split('=');
                result.push({
                    key: key[1],
                    val: parseInt(key[0], 10)
                });
            }
            return result;
        }
        else {
            return null;
        }
    };
    return Parser;
}());
exports.Parser = Parser;
//# sourceMappingURL=parser.js.map