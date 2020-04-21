import { pascalCase, paramCase, camelCase } from 'change-case';
import fs__default, { mkdirSync, writeFileSync, writeFile, existsSync, readFileSync } from 'fs';
import fetch from 'node-fetch';

var COLORS_HLP = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    dim: '\x1b[2m',
    underscore: '\x1b[4m',
    blink: '\x1b[5m',
    reverse: '\x1b[7m',
    hidden: '\x1b[8m'
};
var COLORS_TXT = {
    black: '\x1b[30m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m'
};
var COLORS_BG = {
    black: '\x1b[40m',
    red: '\x1b[41m',
    green: '\x1b[42m',
    yellow: '\x1b[43m',
    blue: '\x1b[44m',
    magenta: '\x1b[45m',
    cyan: '\x1b[46m',
    white: '\x1b[47m'
};
var Logger = /** @class */ (function () {
    function Logger() {
    }
    Logger.prototype.reset = function () {
        process.stdout.write(COLORS_HLP.reset);
        return this;
    };
    Logger.prototype.bg = function (color) {
        process.stdout.write(COLORS_BG[color]);
        return this;
    };
    Logger.prototype.fg = function (color) {
        process.stdout.write(COLORS_TXT[color]);
        return this;
    };
    Logger.prototype.write = function (line) {
        process.stdout.write(line);
        return this;
    };
    Logger.prototype.writeln = function (line) {
        process.stdout.write(line);
        process.stdout.write('\r\n');
        return this;
    };
    Logger.prototype.info = function (message) {
        this.reset().writeln('').fg('blue').writeln(message).reset();
    };
    Logger.prototype.err = function (message) {
        this.reset().writeln('').fg('red').writeln(message).reset();
    };
    Logger.prototype.ok = function (message) {
        this.reset().writeln('').fg('green').writeln(message).reset();
    };
    return Logger;
}());

/* eslint-disable no-fallthrough */
var Jenkins = /** @class */ (function () {
    function Jenkins() {
        this.pc = 0;
        this.pb = 0;
        /**
         * Default first initial seed.
         */
        this.pc = 0;
        /**
         * Default second initial seed.
         */
        this.pb = 0;
    }
    // --------------------------------------------------
    // Public access
    // --------------------------------------------------
    /**
     * Computes and returns 32-bit hash of given message.
     */
    Jenkins.prototype.hash32 = function (msg) {
        var h = this.lookup3(msg, this.pc, this.pb);
        return (h.c).toString(16);
    };
    /**
     * Computes and returns 32-bit hash of given message.
     */
    Jenkins.prototype.hash64 = function (msg) {
        var h = this.lookup3(msg, this.pc, this.pb);
        return (h.b).toString(16) + (h.c).toString(16);
    };
    Jenkins.prototype.lookup3 = function (k, pc, pb) {
        var length = k.length;
        var a;
        var b;
        var c;
        a = b = c = 0xdeadbeef + length + pc;
        c += pb;
        var offset = 0;
        var mixed;
        while (length > 12) {
            a += k.charCodeAt(offset + 0);
            a += k.charCodeAt(offset + 1) << 8;
            a += k.charCodeAt(offset + 2) << 16;
            a += k.charCodeAt(offset + 3) << 24;
            b += k.charCodeAt(offset + 4);
            b += k.charCodeAt(offset + 5) << 8;
            b += k.charCodeAt(offset + 6) << 16;
            b += k.charCodeAt(offset + 7) << 24;
            c += k.charCodeAt(offset + 8);
            c += k.charCodeAt(offset + 9) << 8;
            c += k.charCodeAt(offset + 10) << 16;
            c += k.charCodeAt(offset + 11) << 24;
            mixed = this.mix(a, b, c);
            a = mixed.a;
            b = mixed.b;
            c = mixed.c;
            length -= 12;
            offset += 12;
        }
        switch (length) {
            case 12:
                c += k.charCodeAt(offset + 11) << 24;
            case 11:
                c += k.charCodeAt(offset + 10) << 16;
            case 10:
                c += k.charCodeAt(offset + 9) << 8;
            case 9:
                c += k.charCodeAt(offset + 8);
            case 8:
                b += k.charCodeAt(offset + 7) << 24;
            case 7:
                b += k.charCodeAt(offset + 6) << 16;
            case 6:
                b += k.charCodeAt(offset + 5) << 8;
            case 5:
                b += k.charCodeAt(offset + 4);
            case 4:
                a += k.charCodeAt(offset + 3) << 24;
            case 3:
                a += k.charCodeAt(offset + 2) << 16;
            case 2:
                a += k.charCodeAt(offset + 1) << 8;
            case 1:
                a += k.charCodeAt(offset + 0);
                break;
            case 0:
                return { c: c >>> 0, b: b >>> 0 };
        }
        // Final mixing of three 32-bit values in to c
        mixed = this.finalMix(a, b, c);
        a = mixed.a;
        b = mixed.b;
        c = mixed.c;
        return { c: c >>> 0, b: b >>> 0 };
    };
    /**
     * Mixes 3 32-bit integers reversibly but fast.
     */
    Jenkins.prototype.mix = function (a, b, c) {
        a -= c;
        a ^= this.rot(c, 4);
        c += b;
        b -= a;
        b ^= this.rot(a, 6);
        a += c;
        c -= b;
        c ^= this.rot(b, 8);
        b += a;
        a -= c;
        a ^= this.rot(c, 16);
        c += b;
        b -= a;
        b ^= this.rot(a, 19);
        a += c;
        c -= b;
        c ^= this.rot(b, 4);
        b += a;
        return { a: a, b: b, c: c };
    };
    /**
     * Final mixing of 3 32-bit values (a,b,c) into c
     */
    Jenkins.prototype.finalMix = function (a, b, c) {
        c ^= b;
        c -= this.rot(b, 14);
        a ^= c;
        a -= this.rot(c, 11);
        b ^= a;
        b -= this.rot(a, 25);
        c ^= b;
        c -= this.rot(b, 16);
        a ^= c;
        a -= this.rot(c, 4);
        b ^= a;
        b -= this.rot(a, 14);
        c ^= b;
        c -= this.rot(b, 24);
        return { a: a, b: b, c: c };
    };
    /**
     * Rotate x by k distance.
     */
    Jenkins.prototype.rot = function (x, k) {
        return (((x) << (k)) | ((x) >> (32 - (k))));
    };
    return Jenkins;
}());
// --------------------------------------------------
// Private methods
// --------------------------------------------------

var SimHash = /** @class */ (function () {
    function SimHash(options) {
        this.kshingles = 4;
        this.maxFeatures = 128;
        if (options) {
            /**
             * By default, we tokenize input into chunks of this size.
             */
            if (options.kshingles) {
                this.kshingles = options.kshingles;
            }
            /**
             * By default, this many number of minimum shingles will
             * be combined to create the final hash.
             */
            if (options.maxFeatures) {
                this.maxFeatures = options.maxFeatures;
            }
        }
    }
    // --------------------------------------------------
    // Public access
    // --------------------------------------------------
    /**
     * Driver function.
     */
    SimHash.prototype.hash = function (input) {
        var tokens = this.tokenize(input);
        var shingles = [];
        var jenkins = new Jenkins();
        // eslint-disable-next-line @typescript-eslint/no-for-in-array
        for (var i in tokens) {
            shingles.push(jenkins.hash32(tokens[i]));
        }
        var simhash = this.combineShingles(shingles);
        simhash >>>= 0;
        return simhash;
    };
    /**
     * Tokenizes input into 'kshingles' number of tokens.
     */
    SimHash.prototype.tokenize = function (original) {
        var size = original.length;
        if (size <= this.kshingles) {
            return [original.substr(0)];
        }
        var shingles = [];
        for (var i = 0; i < size; i = i + this.kshingles) {
            shingles.push(i + this.kshingles < size ? original.slice(i, i + this.kshingles) : original.slice(i));
        }
        return shingles;
    };
    SimHash.prototype.combineShingles = function (shingles) {
        if (shingles.length === 0)
            return;
        if (shingles.length === 1)
            return shingles[0];
        // eslint-disable-next-line @typescript-eslint/unbound-method
        shingles.sort(this.hashComparator);
        if (shingles.length > this.maxFeatures)
            shingles = shingles.splice(this.maxFeatures);
        var simhash = 0x0;
        var mask = 0x1;
        for (var pos = 0; pos < 32; pos++) {
            var weight = 0;
            // eslint-disable-next-line @typescript-eslint/no-for-in-array
            for (var i in shingles) {
                var shingle = parseInt(shingles[i], 16);
                weight += !(~shingle & mask) === true ? 1 : -1;
            }
            if (weight > 0)
                simhash |= mask;
            mask <<= 1;
        }
        return simhash;
    };
    /**
     * Calculates binary hamming distance of two base 16 integers.
     */
    SimHash.prototype.hammingDistanceSlow = function (x, y) {
        var distance = 0;
        var val = parseInt(x, 16) ^ parseInt(y, 16);
        while (val) {
            ++distance;
            val &= val - 1;
        }
        return distance;
    };
    /**
     * TODO: Use a priority queue. Till then this comparator is
     * used to find the least 'maxFeatures' shingles.
     */
    SimHash.prototype.hashComparator = function (a, b) {
        return a < b ? -1 : (a > b ? 1 : 0);
    };
    return SimHash;
}());

var Parser = /** @class */ (function () {
    function Parser() {
        this._enums = [];
        this._models = [];
        this._servicesList = {};
        this._logger = new Logger();
        this._simHash = new SimHash();
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
        var tmp = pascalCase(uri.replace(/\//gi, '-').replace(/\{|\}|\$/gi, ''));
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
        var params = this.parseParams(method.parameters, camelCase(name));
        var resp = this.parseResponse(method.responses, camelCase(name));
        return {
            uri: uri.replace(/\{/gi, '${'),
            type: type,
            tag: tag,
            name: camelCase(name),
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
        var withParentName = "" + pascalCase(paramCase(parent).replace(/^i-/gi, '') + '-' + paramCase(curname + 'Set'));
        var propEnum = {
            name: pascalCase(curname) + "Set",
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

var GeneratorParams = [
    {
        name: 'config',
        keys: ['-c', '--c', '-conf'],
        noValue: false,
        description: 'Swagger doc path'
    },
    {
        name: 'out',
        keys: ['-o', '--o', '-out'],
        noValue: false,
        description: 'Output directory'
    },
    {
        name: 'templateFolder',
        keys: ['-t', '--t', '-tmpl'],
        noValue: false,
        description: 'Template Folder'
    },
    {
        name: 'help',
        keys: ['-h', '--h', 'help', '-help'],
        noValue: true,
        description: 'Call help'
    }
];

var HelpCLI = /** @class */ (function () {
    function HelpCLI() {
        this.logger = new Logger();
    }
    HelpCLI.prototype.parseArgs = function () {
        var params = {
            config: '',
            out: '',
            templateFolder: '',
            help: false
        };
        var args = process.argv;
        for (var i = 0; i < args.length; i++) {
            for (var _i = 0, GeneratorParams_1 = GeneratorParams; _i < GeneratorParams_1.length; _i++) {
                var param = GeneratorParams_1[_i];
                if (param.keys.includes(args[i])) {
                    if (param.noValue) {
                        params[param.name] = true;
                        break;
                    }
                    else {
                        params[param.name] = args[i + 1];
                        i++;
                        break;
                    }
                }
            }
        }
        return params;
    };
    HelpCLI.prototype.printHelp = function () {
        this.logger
            .fg('green')
            .writeln('')
            .write('[HELP]')
            .write(':')
            .writeln('')
            .reset()
            .writeln('');
        for (var _i = 0, GeneratorParams_2 = GeneratorParams; _i < GeneratorParams_2.length; _i++) {
            var key = GeneratorParams_2[_i];
            var line = "     " + key.name + "          ";
            line = line.substr(0, 15);
            var args = new Array(40).fill(' ');
            var i = 1;
            for (var _a = 0, _b = key.keys; _a < _b.length; _a++) {
                var arg = _b[_a];
                args[i + 2] = arg;
                i = i + 2;
            }
            this.logger.write(line).fg('yellow');
            line = args.join('');
            line = line.substr(0, 20);
            this.logger.write(line).reset();
            line = '     ' + key.description;
            this.logger.write(line);
            this.logger.writeln('');
        }
    };
    return HelpCLI;
}());

// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = parts.length - 1; i >= 0; i--) {
    var last = parts[i];
    if (last === '.') {
      parts.splice(i, 1);
    } else if (last === '..') {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift('..');
    }
  }

  return parts;
}

// Split a filename into [root, dir, basename, ext], unix version
// 'root' is just a slash, or nothing.
var splitPathRe =
    /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
var splitPath = function(filename) {
  return splitPathRe.exec(filename).slice(1);
};

// path.resolve([from ...], to)
// posix version
function resolve() {
  var resolvedPath = '',
      resolvedAbsolute = false;

  for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
    var path = (i >= 0) ? arguments[i] : '/';

    // Skip empty and invalid entries
    if (typeof path !== 'string') {
      throw new TypeError('Arguments to path.resolve must be strings');
    } else if (!path) {
      continue;
    }

    resolvedPath = path + '/' + resolvedPath;
    resolvedAbsolute = path.charAt(0) === '/';
  }

  // At this point the path should be resolved to a full absolute path, but
  // handle relative paths to be safe (might happen when process.cwd() fails)

  // Normalize the path
  resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
    return !!p;
  }), !resolvedAbsolute).join('/');

  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
}
// path.normalize(path)
// posix version
function normalize(path) {
  var isPathAbsolute = isAbsolute(path),
      trailingSlash = substr(path, -1) === '/';

  // Normalize the path
  path = normalizeArray(filter(path.split('/'), function(p) {
    return !!p;
  }), !isPathAbsolute).join('/');

  if (!path && !isPathAbsolute) {
    path = '.';
  }
  if (path && trailingSlash) {
    path += '/';
  }

  return (isPathAbsolute ? '/' : '') + path;
}
// posix version
function isAbsolute(path) {
  return path.charAt(0) === '/';
}

// posix version
function join() {
  var paths = Array.prototype.slice.call(arguments, 0);
  return normalize(filter(paths, function(p, index) {
    if (typeof p !== 'string') {
      throw new TypeError('Arguments to path.join must be strings');
    }
    return p;
  }).join('/'));
}


// path.relative(from, to)
// posix version
function relative(from, to) {
  from = resolve(from).substr(1);
  to = resolve(to).substr(1);

  function trim(arr) {
    var start = 0;
    for (; start < arr.length; start++) {
      if (arr[start] !== '') break;
    }

    var end = arr.length - 1;
    for (; end >= 0; end--) {
      if (arr[end] !== '') break;
    }

    if (start > end) return [];
    return arr.slice(start, end - start + 1);
  }

  var fromParts = trim(from.split('/'));
  var toParts = trim(to.split('/'));

  var length = Math.min(fromParts.length, toParts.length);
  var samePartsLength = length;
  for (var i = 0; i < length; i++) {
    if (fromParts[i] !== toParts[i]) {
      samePartsLength = i;
      break;
    }
  }

  var outputParts = [];
  for (var i = samePartsLength; i < fromParts.length; i++) {
    outputParts.push('..');
  }

  outputParts = outputParts.concat(toParts.slice(samePartsLength));

  return outputParts.join('/');
}

var sep = '/';
var delimiter = ':';

function dirname(path) {
  var result = splitPath(path),
      root = result[0],
      dir = result[1];

  if (!root && !dir) {
    // No dirname whatsoever
    return '.';
  }

  if (dir) {
    // It has a dirname, strip trailing slash
    dir = dir.substr(0, dir.length - 1);
  }

  return root + dir;
}

function basename(path, ext) {
  var f = splitPath(path)[2];
  // TODO: make this comparison case-insensitive on windows?
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
}


function extname(path) {
  return splitPath(path)[3];
}
var path = {
  extname: extname,
  basename: basename,
  dirname: dirname,
  sep: sep,
  delimiter: delimiter,
  relative: relative,
  join: join,
  isAbsolute: isAbsolute,
  normalize: normalize,
  resolve: resolve
};
function filter (xs, f) {
    if (xs.filter) return xs.filter(f);
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        if (f(xs[i], i, xs)) res.push(xs[i]);
    }
    return res;
}

// String.prototype.substr - negative index don't work in IE8
var substr = 'ab'.substr(-1) === 'b' ?
    function (str, start, len) { return str.substr(start, len) } :
    function (str, start, len) {
        if (start < 0) start = str.length + start;
        return str.substr(start, len);
    }
;

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

function getCjsExportFromNamespace (n) {
	return n && n['default'] || n;
}

var utils = createCommonjsModule(function (module, exports) {

var regExpChars = /[|\\{}()[\]^$+*?.]/g;

/**
 * Escape characters reserved in regular expressions.
 *
 * If `string` is `undefined` or `null`, the empty string is returned.
 *
 * @param {String} string Input string
 * @return {String} Escaped string
 * @static
 * @private
 */
exports.escapeRegExpChars = function (string) {
  // istanbul ignore if
  if (!string) {
    return '';
  }
  return String(string).replace(regExpChars, '\\$&');
};

var _ENCODE_HTML_RULES = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&#34;',
  "'": '&#39;'
};
var _MATCH_HTML = /[&<>'"]/g;

function encode_char(c) {
  return _ENCODE_HTML_RULES[c] || c;
}

/**
 * Stringified version of constants used by {@link module:utils.escapeXML}.
 *
 * It is used in the process of generating {@link ClientFunction}s.
 *
 * @readonly
 * @type {String}
 */

var escapeFuncStr =
  'var _ENCODE_HTML_RULES = {\n'
+ '      "&": "&amp;"\n'
+ '    , "<": "&lt;"\n'
+ '    , ">": "&gt;"\n'
+ '    , \'"\': "&#34;"\n'
+ '    , "\'": "&#39;"\n'
+ '    }\n'
+ '  , _MATCH_HTML = /[&<>\'"]/g;\n'
+ 'function encode_char(c) {\n'
+ '  return _ENCODE_HTML_RULES[c] || c;\n'
+ '};\n';

/**
 * Escape characters reserved in XML.
 *
 * If `markup` is `undefined` or `null`, the empty string is returned.
 *
 * @implements {EscapeCallback}
 * @param {String} markup Input string
 * @return {String} Escaped string
 * @static
 * @private
 */

exports.escapeXML = function (markup) {
  return markup == undefined
    ? ''
    : String(markup)
      .replace(_MATCH_HTML, encode_char);
};
exports.escapeXML.toString = function () {
  return Function.prototype.toString.call(this) + ';\n' + escapeFuncStr;
};

/**
 * Naive copy of properties from one object to another.
 * Does not recurse into non-scalar properties
 * Does not check to see if the property has a value before copying
 *
 * @param  {Object} to   Destination object
 * @param  {Object} from Source object
 * @return {Object}      Destination object
 * @static
 * @private
 */
exports.shallowCopy = function (to, from) {
  from = from || {};
  for (var p in from) {
    to[p] = from[p];
  }
  return to;
};

/**
 * Naive copy of a list of key names, from one object to another.
 * Only copies property if it is actually defined
 * Does not recurse into non-scalar properties
 *
 * @param  {Object} to   Destination object
 * @param  {Object} from Source object
 * @param  {Array} list List of properties to copy
 * @return {Object}      Destination object
 * @static
 * @private
 */
exports.shallowCopyFromList = function (to, from, list) {
  for (var i = 0; i < list.length; i++) {
    var p = list[i];
    if (typeof from[p] != 'undefined') {
      to[p] = from[p];
    }
  }
  return to;
};

/**
 * Simple in-process cache implementation. Does not implement limits of any
 * sort.
 *
 * @implements {Cache}
 * @static
 * @private
 */
exports.cache = {
  _data: {},
  set: function (key, val) {
    this._data[key] = val;
  },
  get: function (key) {
    return this._data[key];
  },
  remove: function (key) {
    delete this._data[key];
  },
  reset: function () {
    this._data = {};
  }
};
});
var utils_1 = utils.escapeRegExpChars;
var utils_2 = utils.escapeXML;
var utils_3 = utils.shallowCopy;
var utils_4 = utils.shallowCopyFromList;
var utils_5 = utils.cache;

var _from = "ejs";
var _id = "ejs@3.0.2";
var _inBundle = false;
var _integrity = "sha512-IncmUpn1yN84hy2shb0POJ80FWrfGNY0cxO9f4v+/sG7qcBvAtVWUA1IdzY/8EYUmOVhoKJVdJjNd3AZcnxOjA==";
var _location = "/ejs";
var _phantomChildren = {
};
var _requested = {
	type: "tag",
	registry: true,
	raw: "ejs",
	name: "ejs",
	escapedName: "ejs",
	rawSpec: "",
	saveSpec: null,
	fetchSpec: "latest"
};
var _requiredBy = [
	"#DEV:/",
	"#USER"
];
var _resolved = "https://registry.npmjs.org/ejs/-/ejs-3.0.2.tgz";
var _shasum = "745b01cdcfe38c1c6a2da3bbb2d9957060a31226";
var _spec = "ejs";
var _where = "/Volumes/Transcend/dev/sw2ngx";
var author = {
	name: "Matthew Eernisse",
	email: "mde@fleegix.org",
	url: "http://fleegix.org"
};
var bugs = {
	url: "https://github.com/mde/ejs/issues"
};
var bundleDependencies = false;
var dependencies = {
};
var deprecated = false;
var description = "Embedded JavaScript templates";
var devDependencies = {
	browserify: "^13.1.1",
	eslint: "^4.14.0",
	"git-directory-deploy": "^1.5.1",
	jake: "^10.3.1",
	jsdoc: "^3.4.0",
	"lru-cache": "^4.0.1",
	mocha: "^5.0.5",
	"uglify-js": "^3.3.16"
};
var engines = {
	node: ">=0.10.0"
};
var homepage = "https://github.com/mde/ejs";
var keywords = [
	"template",
	"engine",
	"ejs"
];
var license = "Apache-2.0";
var main = "./lib/ejs.js";
var name = "ejs";
var repository = {
	type: "git",
	url: "git://github.com/mde/ejs.git"
};
var scripts = {
	postinstall: "node --harmony ./postinstall.js",
	test: "mocha"
};
var version = "3.0.2";
var _package = {
	_from: _from,
	_id: _id,
	_inBundle: _inBundle,
	_integrity: _integrity,
	_location: _location,
	_phantomChildren: _phantomChildren,
	_requested: _requested,
	_requiredBy: _requiredBy,
	_resolved: _resolved,
	_shasum: _shasum,
	_spec: _spec,
	_where: _where,
	author: author,
	bugs: bugs,
	bundleDependencies: bundleDependencies,
	dependencies: dependencies,
	deprecated: deprecated,
	description: description,
	devDependencies: devDependencies,
	engines: engines,
	homepage: homepage,
	keywords: keywords,
	license: license,
	main: main,
	name: name,
	repository: repository,
	scripts: scripts,
	version: version
};

var _package$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  _from: _from,
  _id: _id,
  _inBundle: _inBundle,
  _integrity: _integrity,
  _location: _location,
  _phantomChildren: _phantomChildren,
  _requested: _requested,
  _requiredBy: _requiredBy,
  _resolved: _resolved,
  _shasum: _shasum,
  _spec: _spec,
  _where: _where,
  author: author,
  bugs: bugs,
  bundleDependencies: bundleDependencies,
  dependencies: dependencies,
  deprecated: deprecated,
  description: description,
  devDependencies: devDependencies,
  engines: engines,
  homepage: homepage,
  keywords: keywords,
  license: license,
  main: main,
  name: name,
  repository: repository,
  scripts: scripts,
  version: version,
  'default': _package
});

var require$$0 = getCjsExportFromNamespace(_package$1);

var ejs = createCommonjsModule(function (module, exports) {

/**
 * @file Embedded JavaScript templating engine. {@link http://ejs.co}
 * @author Matthew Eernisse <mde@fleegix.org>
 * @author Tiancheng "Timothy" Gu <timothygu99@gmail.com>
 * @project EJS
 * @license {@link http://www.apache.org/licenses/LICENSE-2.0 Apache License, Version 2.0}
 */

/**
 * EJS internal functions.
 *
 * Technically this "module" lies in the same file as {@link module:ejs}, for
 * the sake of organization all the private functions re grouped into this
 * module.
 *
 * @module ejs-internal
 * @private
 */

/**
 * Embedded JavaScript templating engine.
 *
 * @module ejs
 * @public
 */





var scopeOptionWarned = false;
/** @type {string} */
var _VERSION_STRING = require$$0.version;
var _DEFAULT_OPEN_DELIMITER = '<';
var _DEFAULT_CLOSE_DELIMITER = '>';
var _DEFAULT_DELIMITER = '%';
var _DEFAULT_LOCALS_NAME = 'locals';
var _NAME = 'ejs';
var _REGEX_STRING = '(<%%|%%>|<%=|<%-|<%_|<%#|<%|%>|-%>|_%>)';
var _OPTS_PASSABLE_WITH_DATA = ['delimiter', 'scope', 'context', 'debug', 'compileDebug',
  'client', '_with', 'rmWhitespace', 'strict', 'filename', 'async'];
// We don't allow 'cache' option to be passed in the data obj for
// the normal `render` call, but this is where Express 2 & 3 put it
// so we make an exception for `renderFile`
var _OPTS_PASSABLE_WITH_DATA_EXPRESS = _OPTS_PASSABLE_WITH_DATA.concat('cache');
var _BOM = /^\uFEFF/;

/**
 * EJS template function cache. This can be a LRU object from lru-cache NPM
 * module. By default, it is {@link module:utils.cache}, a simple in-process
 * cache that grows continuously.
 *
 * @type {Cache}
 */

exports.cache = utils.cache;

/**
 * Custom file loader. Useful for template preprocessing or restricting access
 * to a certain part of the filesystem.
 *
 * @type {fileLoader}
 */

exports.fileLoader = fs__default.readFileSync;

/**
 * Name of the object containing the locals.
 *
 * This variable is overridden by {@link Options}`.localsName` if it is not
 * `undefined`.
 *
 * @type {String}
 * @public
 */

exports.localsName = _DEFAULT_LOCALS_NAME;

/**
 * Promise implementation -- defaults to the native implementation if available
 * This is mostly just for testability
 *
 * @type {PromiseConstructorLike}
 * @public
 */

exports.promiseImpl = (new Function('return this;'))().Promise;

/**
 * Get the path to the included file from the parent file path and the
 * specified path.
 *
 * @param {String}  name     specified path
 * @param {String}  filename parent file path
 * @param {Boolean} [isDir=false] whether the parent file path is a directory
 * @return {String}
 */
exports.resolveInclude = function(name, filename, isDir) {
  var dirname = path.dirname;
  var extname = path.extname;
  var resolve = path.resolve;
  var includePath = resolve(isDir ? filename : dirname(filename), name);
  var ext = extname(name);
  if (!ext) {
    includePath += '.ejs';
  }
  return includePath;
};

/**
 * Get the path to the included file by Options
 *
 * @param  {String}  path    specified path
 * @param  {Options} options compilation options
 * @return {String}
 */
function getIncludePath(path, options) {
  var includePath;
  var filePath;
  var views = options.views;
  var match = /^[A-Za-z]+:\\|^\//.exec(path);

  // Abs path
  if (match && match.length) {
    includePath = exports.resolveInclude(path.replace(/^\/*/,''), options.root || '/', true);
  }
  // Relative paths
  else {
    // Look relative to a passed filename first
    if (options.filename) {
      filePath = exports.resolveInclude(path, options.filename);
      if (fs__default.existsSync(filePath)) {
        includePath = filePath;
      }
    }
    // Then look in any views directories
    if (!includePath) {
      if (Array.isArray(views) && views.some(function (v) {
        filePath = exports.resolveInclude(path, v, true);
        return fs__default.existsSync(filePath);
      })) {
        includePath = filePath;
      }
    }
    if (!includePath) {
      throw new Error('Could not find the include file "' +
          options.escapeFunction(path) + '"');
    }
  }
  return includePath;
}

/**
 * Get the template from a string or a file, either compiled on-the-fly or
 * read from cache (if enabled), and cache the template if needed.
 *
 * If `template` is not set, the file specified in `options.filename` will be
 * read.
 *
 * If `options.cache` is true, this function reads the file from
 * `options.filename` so it must be set prior to calling this function.
 *
 * @memberof module:ejs-internal
 * @param {Options} options   compilation options
 * @param {String} [template] template source
 * @return {(TemplateFunction|ClientFunction)}
 * Depending on the value of `options.client`, either type might be returned.
 * @static
 */

function handleCache(options, template) {
  var func;
  var filename = options.filename;
  var hasTemplate = arguments.length > 1;

  if (options.cache) {
    if (!filename) {
      throw new Error('cache option requires a filename');
    }
    func = exports.cache.get(filename);
    if (func) {
      return func;
    }
    if (!hasTemplate) {
      template = fileLoader(filename).toString().replace(_BOM, '');
    }
  }
  else if (!hasTemplate) {
    // istanbul ignore if: should not happen at all
    if (!filename) {
      throw new Error('Internal EJS error: no file name or template '
                    + 'provided');
    }
    template = fileLoader(filename).toString().replace(_BOM, '');
  }
  func = exports.compile(template, options);
  if (options.cache) {
    exports.cache.set(filename, func);
  }
  return func;
}

/**
 * Try calling handleCache with the given options and data and call the
 * callback with the result. If an error occurs, call the callback with
 * the error. Used by renderFile().
 *
 * @memberof module:ejs-internal
 * @param {Options} options    compilation options
 * @param {Object} data        template data
 * @param {RenderFileCallback} cb callback
 * @static
 */

function tryHandleCache(options, data, cb) {
  var result;
  if (!cb) {
    if (typeof exports.promiseImpl == 'function') {
      return new exports.promiseImpl(function (resolve, reject) {
        try {
          result = handleCache(options)(data);
          resolve(result);
        }
        catch (err) {
          reject(err);
        }
      });
    }
    else {
      throw new Error('Please provide a callback function');
    }
  }
  else {
    try {
      result = handleCache(options)(data);
    }
    catch (err) {
      return cb(err);
    }

    cb(null, result);
  }
}

/**
 * fileLoader is independent
 *
 * @param {String} filePath ejs file path.
 * @return {String} The contents of the specified file.
 * @static
 */

function fileLoader(filePath){
  return exports.fileLoader(filePath);
}

/**
 * Get the template function.
 *
 * If `options.cache` is `true`, then the template is cached.
 *
 * @memberof module:ejs-internal
 * @param {String}  path    path for the specified file
 * @param {Options} options compilation options
 * @return {(TemplateFunction|ClientFunction)}
 * Depending on the value of `options.client`, either type might be returned
 * @static
 */

function includeFile(path, options) {
  var opts = utils.shallowCopy({}, options);
  opts.filename = getIncludePath(path, opts);
  return handleCache(opts);
}

/**
 * Re-throw the given `err` in context to the `str` of ejs, `filename`, and
 * `lineno`.
 *
 * @implements {RethrowCallback}
 * @memberof module:ejs-internal
 * @param {Error}  err      Error object
 * @param {String} str      EJS source
 * @param {String} flnm     file name of the EJS file
 * @param {Number} lineno   line number of the error
 * @param {EscapeCallback} esc
 * @static
 */

function rethrow(err, str, flnm, lineno, esc) {
  var lines = str.split('\n');
  var start = Math.max(lineno - 3, 0);
  var end = Math.min(lines.length, lineno + 3);
  var filename = esc(flnm);
  // Error context
  var context = lines.slice(start, end).map(function (line, i){
    var curr = i + start + 1;
    return (curr == lineno ? ' >> ' : '    ')
      + curr
      + '| '
      + line;
  }).join('\n');

  // Alter exception message
  err.path = filename;
  err.message = (filename || 'ejs') + ':'
    + lineno + '\n'
    + context + '\n\n'
    + err.message;

  throw err;
}

function stripSemi(str){
  return str.replace(/;(\s*$)/, '$1');
}

/**
 * Compile the given `str` of ejs into a template function.
 *
 * @param {String}  template EJS template
 *
 * @param {Options} [opts] compilation options
 *
 * @return {(TemplateFunction|ClientFunction)}
 * Depending on the value of `opts.client`, either type might be returned.
 * Note that the return type of the function also depends on the value of `opts.async`.
 * @public
 */

exports.compile = function compile(template, opts) {
  var templ;

  // v1 compat
  // 'scope' is 'context'
  // FIXME: Remove this in a future version
  if (opts && opts.scope) {
    if (!scopeOptionWarned){
      console.warn('`scope` option is deprecated and will be removed in EJS 3');
      scopeOptionWarned = true;
    }
    if (!opts.context) {
      opts.context = opts.scope;
    }
    delete opts.scope;
  }
  templ = new Template(template, opts);
  return templ.compile();
};

/**
 * Render the given `template` of ejs.
 *
 * If you would like to include options but not data, you need to explicitly
 * call this function with `data` being an empty object or `null`.
 *
 * @param {String}   template EJS template
 * @param {Object}  [data={}] template data
 * @param {Options} [opts={}] compilation and rendering options
 * @return {(String|Promise<String>)}
 * Return value type depends on `opts.async`.
 * @public
 */

exports.render = function (template, d, o) {
  var data = d || {};
  var opts = o || {};

  // No options object -- if there are optiony names
  // in the data, copy them to options
  if (arguments.length == 2) {
    utils.shallowCopyFromList(opts, data, _OPTS_PASSABLE_WITH_DATA);
  }

  return handleCache(opts, template)(data);
};

/**
 * Render an EJS file at the given `path` and callback `cb(err, str)`.
 *
 * If you would like to include options but not data, you need to explicitly
 * call this function with `data` being an empty object or `null`.
 *
 * @param {String}             path     path to the EJS file
 * @param {Object}            [data={}] template data
 * @param {Options}           [opts={}] compilation and rendering options
 * @param {RenderFileCallback} cb callback
 * @public
 */

exports.renderFile = function () {
  var args = Array.prototype.slice.call(arguments);
  var filename = args.shift();
  var cb;
  var opts = {filename: filename};
  var data;
  var viewOpts;

  // Do we have a callback?
  if (typeof arguments[arguments.length - 1] == 'function') {
    cb = args.pop();
  }
  // Do we have data/opts?
  if (args.length) {
    // Should always have data obj
    data = args.shift();
    // Normal passed opts (data obj + opts obj)
    if (args.length) {
      // Use shallowCopy so we don't pollute passed in opts obj with new vals
      utils.shallowCopy(opts, args.pop());
    }
    // Special casing for Express (settings + opts-in-data)
    else {
      // Express 3 and 4
      if (data.settings) {
        // Pull a few things from known locations
        if (data.settings.views) {
          opts.views = data.settings.views;
        }
        if (data.settings['view cache']) {
          opts.cache = true;
        }
        // Undocumented after Express 2, but still usable, esp. for
        // items that are unsafe to be passed along with data, like `root`
        viewOpts = data.settings['view options'];
        if (viewOpts) {
          utils.shallowCopy(opts, viewOpts);
        }
      }
      // Express 2 and lower, values set in app.locals, or people who just
      // want to pass options in their data. NOTE: These values will override
      // anything previously set in settings  or settings['view options']
      utils.shallowCopyFromList(opts, data, _OPTS_PASSABLE_WITH_DATA_EXPRESS);
    }
    opts.filename = filename;
  }
  else {
    data = {};
  }

  return tryHandleCache(opts, data, cb);
};

/**
 * Clear intermediate JavaScript cache. Calls {@link Cache#reset}.
 * @public
 */

/**
 * EJS template class
 * @public
 */
exports.Template = Template;

exports.clearCache = function () {
  exports.cache.reset();
};

function Template(text, opts) {
  opts = opts || {};
  var options = {};
  this.templateText = text;
  /** @type {string | null} */
  this.mode = null;
  this.truncate = false;
  this.currentLine = 1;
  this.source = '';
  options.client = opts.client || false;
  options.escapeFunction = opts.escape || opts.escapeFunction || utils.escapeXML;
  options.compileDebug = opts.compileDebug !== false;
  options.debug = !!opts.debug;
  options.filename = opts.filename;
  options.openDelimiter = opts.openDelimiter || exports.openDelimiter || _DEFAULT_OPEN_DELIMITER;
  options.closeDelimiter = opts.closeDelimiter || exports.closeDelimiter || _DEFAULT_CLOSE_DELIMITER;
  options.delimiter = opts.delimiter || exports.delimiter || _DEFAULT_DELIMITER;
  options.strict = opts.strict || false;
  options.context = opts.context;
  options.cache = opts.cache || false;
  options.rmWhitespace = opts.rmWhitespace;
  options.root = opts.root;
  options.outputFunctionName = opts.outputFunctionName;
  options.localsName = opts.localsName || exports.localsName || _DEFAULT_LOCALS_NAME;
  options.views = opts.views;
  options.async = opts.async;
  options.destructuredLocals = opts.destructuredLocals;
  options.legacyInclude = typeof opts.legacyInclude != 'undefined' ? !!opts.legacyInclude : true;

  if (options.strict) {
    options._with = false;
  }
  else {
    options._with = typeof opts._with != 'undefined' ? opts._with : true;
  }

  this.opts = options;

  this.regex = this.createRegex();
}

Template.modes = {
  EVAL: 'eval',
  ESCAPED: 'escaped',
  RAW: 'raw',
  COMMENT: 'comment',
  LITERAL: 'literal'
};

Template.prototype = {
  createRegex: function () {
    var str = _REGEX_STRING;
    var delim = utils.escapeRegExpChars(this.opts.delimiter);
    var open = utils.escapeRegExpChars(this.opts.openDelimiter);
    var close = utils.escapeRegExpChars(this.opts.closeDelimiter);
    str = str.replace(/%/g, delim)
      .replace(/</g, open)
      .replace(/>/g, close);
    return new RegExp(str);
  },

  compile: function () {
    /** @type {string} */
    var src;
    /** @type {ClientFunction} */
    var fn;
    var opts = this.opts;
    var prepended = '';
    var appended = '';
    /** @type {EscapeCallback} */
    var escapeFn = opts.escapeFunction;
    /** @type {FunctionConstructor} */
    var ctor;

    if (!this.source) {
      this.generateSource();
      prepended +=
        '  var __output = "";\n' +
        '  function __append(s) { if (s !== undefined && s !== null) __output += s }\n';
      if (opts.outputFunctionName) {
        prepended += '  var ' + opts.outputFunctionName + ' = __append;' + '\n';
      }
      if (opts.destructuredLocals && opts.destructuredLocals.length) {
        var destructuring = '  var __locals = (' + opts.localsName + ' || {}),\n';
        for (var i = 0; i < opts.destructuredLocals.length; i++) {
          var name = opts.destructuredLocals[i];
          if (i > 0) {
            destructuring += ',\n  ';
          }
          destructuring += name + ' = __locals.' + name;
        }
        prepended += destructuring + ';\n';
      }
      if (opts._with !== false) {
        prepended +=  '  with (' + opts.localsName + ' || {}) {' + '\n';
        appended += '  }' + '\n';
      }
      appended += '  return __output;' + '\n';
      this.source = prepended + this.source + appended;
    }

    if (opts.compileDebug) {
      src = 'var __line = 1' + '\n'
        + '  , __lines = ' + JSON.stringify(this.templateText) + '\n'
        + '  , __filename = ' + (opts.filename ?
        JSON.stringify(opts.filename) : 'undefined') + ';' + '\n'
        + 'try {' + '\n'
        + this.source
        + '} catch (e) {' + '\n'
        + '  rethrow(e, __lines, __filename, __line, escapeFn);' + '\n'
        + '}' + '\n';
    }
    else {
      src = this.source;
    }

    if (opts.client) {
      src = 'escapeFn = escapeFn || ' + escapeFn.toString() + ';' + '\n' + src;
      if (opts.compileDebug) {
        src = 'rethrow = rethrow || ' + rethrow.toString() + ';' + '\n' + src;
      }
    }

    if (opts.strict) {
      src = '"use strict";\n' + src;
    }
    if (opts.debug) {
      console.log(src);
    }
    if (opts.compileDebug && opts.filename) {
      src = src + '\n'
        + '//# sourceURL=' + opts.filename + '\n';
    }

    try {
      if (opts.async) {
        // Have to use generated function for this, since in envs without support,
        // it breaks in parsing
        try {
          ctor = (new Function('return (async function(){}).constructor;'))();
        }
        catch(e) {
          if (e instanceof SyntaxError) {
            throw new Error('This environment does not support async/await');
          }
          else {
            throw e;
          }
        }
      }
      else {
        ctor = Function;
      }
      fn = new ctor(opts.localsName + ', escapeFn, include, rethrow', src);
    }
    catch(e) {
      // istanbul ignore else
      if (e instanceof SyntaxError) {
        if (opts.filename) {
          e.message += ' in ' + opts.filename;
        }
        e.message += ' while compiling ejs\n\n';
        e.message += 'If the above error is not helpful, you may want to try EJS-Lint:\n';
        e.message += 'https://github.com/RyanZim/EJS-Lint';
        if (!opts.async) {
          e.message += '\n';
          e.message += 'Or, if you meant to create an async function, pass `async: true` as an option.';
        }
      }
      throw e;
    }

    // Return a callable function which will execute the function
    // created by the source-code, with the passed data as locals
    // Adds a local `include` function which allows full recursive include
    var returnedFn = opts.client ? fn : function anonymous(data) {
      var include = function (path, includeData) {
        var d = utils.shallowCopy({}, data);
        if (includeData) {
          d = utils.shallowCopy(d, includeData);
        }
        return includeFile(path, opts)(d);
      };
      return fn.apply(opts.context, [data || {}, escapeFn, include, rethrow]);
    };
    if (opts.filename && typeof Object.defineProperty === 'function') {
      var filename = opts.filename;
      var basename = path.basename(filename, path.extname(filename));
      try {
        Object.defineProperty(returnedFn, 'name', {
          value: basename,
          writable: false,
          enumerable: false,
          configurable: true
        });
      } catch (e) {/* ignore */}
    }
    return returnedFn;
  },

  generateSource: function () {
    var opts = this.opts;

    if (opts.rmWhitespace) {
      // Have to use two separate replace here as `^` and `$` operators don't
      // work well with `\r` and empty lines don't work well with the `m` flag.
      this.templateText =
        this.templateText.replace(/[\r\n]+/g, '\n').replace(/^\s+|\s+$/gm, '');
    }

    // Slurp spaces and tabs before <%_ and after _%>
    this.templateText =
      this.templateText.replace(/[ \t]*<%_/gm, '<%_').replace(/_%>[ \t]*/gm, '_%>');

    var self = this;
    var matches = this.parseTemplateText();
    var d = this.opts.delimiter;
    var o = this.opts.openDelimiter;
    var c = this.opts.closeDelimiter;

    if (matches && matches.length) {
      matches.forEach(function (line, index) {
        var closing;
        // If this is an opening tag, check for closing tags
        // FIXME: May end up with some false positives here
        // Better to store modes as k/v with openDelimiter + delimiter as key
        // Then this can simply check against the map
        if ( line.indexOf(o + d) === 0        // If it is a tag
          && line.indexOf(o + d + d) !== 0) { // and is not escaped
          closing = matches[index + 2];
          if (!(closing == d + c || closing == '-' + d + c || closing == '_' + d + c)) {
            throw new Error('Could not find matching close tag for "' + line + '".');
          }
        }
        self.scanLine(line);
      });
    }

  },

  parseTemplateText: function () {
    var str = this.templateText;
    var pat = this.regex;
    var result = pat.exec(str);
    var arr = [];
    var firstPos;

    while (result) {
      firstPos = result.index;

      if (firstPos !== 0) {
        arr.push(str.substring(0, firstPos));
        str = str.slice(firstPos);
      }

      arr.push(result[0]);
      str = str.slice(result[0].length);
      result = pat.exec(str);
    }

    if (str) {
      arr.push(str);
    }

    return arr;
  },

  _addOutput: function (line) {
    if (this.truncate) {
      // Only replace single leading linebreak in the line after
      // -%> tag -- this is the single, trailing linebreak
      // after the tag that the truncation mode replaces
      // Handle Win / Unix / old Mac linebreaks -- do the \r\n
      // combo first in the regex-or
      line = line.replace(/^(?:\r\n|\r|\n)/, '');
      this.truncate = false;
    }
    if (!line) {
      return line;
    }

    // Preserve literal slashes
    line = line.replace(/\\/g, '\\\\');

    // Convert linebreaks
    line = line.replace(/\n/g, '\\n');
    line = line.replace(/\r/g, '\\r');

    // Escape double-quotes
    // - this will be the delimiter during execution
    line = line.replace(/"/g, '\\"');
    this.source += '    ; __append("' + line + '")' + '\n';
  },

  scanLine: function (line) {
    var self = this;
    var d = this.opts.delimiter;
    var o = this.opts.openDelimiter;
    var c = this.opts.closeDelimiter;
    var newLineCount = 0;

    newLineCount = (line.split('\n').length - 1);

    switch (line) {
    case o + d:
    case o + d + '_':
      this.mode = Template.modes.EVAL;
      break;
    case o + d + '=':
      this.mode = Template.modes.ESCAPED;
      break;
    case o + d + '-':
      this.mode = Template.modes.RAW;
      break;
    case o + d + '#':
      this.mode = Template.modes.COMMENT;
      break;
    case o + d + d:
      this.mode = Template.modes.LITERAL;
      this.source += '    ; __append("' + line.replace(o + d + d, o + d) + '")' + '\n';
      break;
    case d + d + c:
      this.mode = Template.modes.LITERAL;
      this.source += '    ; __append("' + line.replace(d + d + c, d + c) + '")' + '\n';
      break;
    case d + c:
    case '-' + d + c:
    case '_' + d + c:
      if (this.mode == Template.modes.LITERAL) {
        this._addOutput(line);
      }

      this.mode = null;
      this.truncate = line.indexOf('-') === 0 || line.indexOf('_') === 0;
      break;
    default:
      // In script mode, depends on type of tag
      if (this.mode) {
        // If '//' is found without a line break, add a line break.
        switch (this.mode) {
        case Template.modes.EVAL:
        case Template.modes.ESCAPED:
        case Template.modes.RAW:
          if (line.lastIndexOf('//') > line.lastIndexOf('\n')) {
            line += '\n';
          }
        }
        switch (this.mode) {
        // Just executing code
        case Template.modes.EVAL:
          this.source += '    ; ' + line + '\n';
          break;
          // Exec, esc, and output
        case Template.modes.ESCAPED:
          this.source += '    ; __append(escapeFn(' + stripSemi(line) + '))' + '\n';
          break;
          // Exec and output
        case Template.modes.RAW:
          this.source += '    ; __append(' + stripSemi(line) + ')' + '\n';
          break;
        case Template.modes.COMMENT:
          // Do nothing
          break;
          // Literal <%% mode, append as raw output
        case Template.modes.LITERAL:
          this._addOutput(line);
          break;
        }
      }
      // In string mode, just add the output
      else {
        this._addOutput(line);
      }
    }

    if (self.opts.compileDebug && newLineCount) {
      this.currentLine += newLineCount;
      this.source += '    ; __line = ' + this.currentLine + '\n';
    }
  }
};

/**
 * Escape characters reserved in XML.
 *
 * This is simply an export of {@link module:utils.escapeXML}.
 *
 * If `markup` is `undefined` or `null`, the empty string is returned.
 *
 * @param {String} markup Input string
 * @return {String} Escaped string
 * @public
 * @func
 * */
exports.escapeXML = utils.escapeXML;

/**
 * Express.js support.
 *
 * This is an alias for {@link module:ejs.renderFile}, in order to support
 * Express.js out-of-the-box.
 *
 * @func
 */

exports.__express = exports.renderFile;

/**
 * Version of EJS.
 *
 * @readonly
 * @type {String}
 * @public
 */

exports.VERSION = _VERSION_STRING;

/**
 * Name for detection of EJS.
 *
 * @readonly
 * @type {String}
 * @public
 */

exports.name = _NAME;

/* istanbul ignore if */
if (typeof window != 'undefined') {
  window.ejs = exports;
}
});
var ejs_1 = ejs.cache;
var ejs_2 = ejs.fileLoader;
var ejs_3 = ejs.localsName;
var ejs_4 = ejs.promiseImpl;
var ejs_5 = ejs.resolveInclude;
var ejs_6 = ejs.compile;
var ejs_7 = ejs.render;
var ejs_8 = ejs.renderFile;
var ejs_9 = ejs.Template;
var ejs_10 = ejs.clearCache;
var ejs_11 = ejs.escapeXML;
var ejs_12 = ejs.__express;
var ejs_13 = ejs.VERSION;
var ejs_14 = ejs.name;

var TemplatePrinter = /** @class */ (function () {
    function TemplatePrinter() {
        this.out = '';
        this._printedServices = [];
        this._logger = new Logger();
        this._templateFolder = '';
        this._stdTemplateFolder = resolve(__dirname, '../../templates/default/');
        this._singleFileTemplateFolrder = resolve(__dirname, './templates/default/');
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    TemplatePrinter.prototype.createFolders = function () {
        var _this = this;
        return new Promise(function (resolve$1, reject) {
            try {
                mkdirSync(resolve(_this.out));
                mkdirSync(resolve(_this.out + '/models'));
                mkdirSync(resolve(_this.out + '/models/enums'));
                mkdirSync(resolve(_this.out + '/services'));
                resolve$1();
                return;
            }
            catch (error) {
                reject();
            }
        });
    };
    TemplatePrinter.prototype.print = function (enums, models, services, out, templateFolder) {
        var _this = this;
        this.out = out;
        this._templateFolder = templateFolder ? templateFolder : '';
        return new Promise(function (resolve, reject) {
            _this.createFolders()
                .then(function () {
                for (var _i = 0, enums_1 = enums; _i < enums_1.length; _i++) {
                    var item = enums_1[_i];
                    _this.printEnum(item);
                }
                _this.printEnumIndex(enums);
                for (var _a = 0, models_1 = models; _a < models_1.length; _a++) {
                    var item = models_1[_a];
                    _this.printModel(item);
                }
                _this.printModelIndex(models);
                for (var name_1 in services) {
                    if (services[name_1] && services[name_1].methods.length > 0) {
                        _this.printService(services[name_1], name_1);
                    }
                }
                _this.printServiceIndex();
                _this.printModule();
                _this.printIndex();
                resolve();
            })
                .catch(function (err) { return reject(err); });
        });
    };
    TemplatePrinter.prototype.printEnum = function (value) {
        var _this = this;
        var template = this.getTemplate('enum');
        if (template === '') {
            return;
        }
        ejs_8(template, {
            value: value
        }, {}, function (err, str) {
            if (err) {
                _this._logger.err("[ ERROR ] EJS print error: " + err);
                return;
            }
            try {
                writeFileSync(resolve(_this.out + '/models/enums/' + paramCase(value.name) + '.enum.ts'), str);
            }
            catch (e) {
                _this._logger.err('[ ERROR ] file: ' +
                    _this.out +
                    '/models/enums/' +
                    paramCase(value.name) +
                    '.enum.ts');
            }
        });
    };
    TemplatePrinter.prototype.printModel = function (model) {
        var _this = this;
        var template = this.getTemplate('model');
        if (template === '') {
            return;
        }
        ejs_8(template, {
            model: model
        }, {}, function (err, str) {
            if (err) {
                _this._logger.err("[ ERROR ] EJS print error: " + err);
                return;
            }
            writeFile(resolve(_this.out +
                '/models/' +
                paramCase(model.name).replace(/^i-/gi, '') +
                '.model.ts'), str, function (err) {
                if (err) {
                    _this._logger.err('[ ERROR ] file: ' +
                        _this.out +
                        '/models/' +
                        paramCase(model.name).replace(/^i-/gi, '') +
                        '.model.ts');
                    return;
                }
                _this._logger.ok('[ OK    ] file: ' +
                    _this.out +
                    '/models/' +
                    paramCase(model.name).replace(/^i-/gi, '') +
                    '.model.ts');
            });
        });
    };
    TemplatePrinter.prototype.printService = function (service, name) {
        var _this = this;
        var template = this.getTemplate('service');
        if (template === '') {
            return;
        }
        ejs_8(template, {
            service: service,
            fnpascalCase: pascalCase,
            name: name
        }, {}, function (err, str) {
            if (err) {
                _this._logger.err("[ ERROR ] EJS print error: " + err);
                return;
            }
            _this._printedServices.push(pascalCase(name));
            writeFile(resolve(_this.out + '/services/' + paramCase(name) + '.service.ts'), str, function (err) {
                if (err) {
                    _this._logger.err('[ ERROR ] file: ' +
                        _this.out +
                        '/services/' +
                        paramCase(name) +
                        '.service.ts');
                    return;
                }
                _this._logger.ok('[ OK    ] file: ' +
                    _this.out +
                    '/services/' +
                    paramCase(name) +
                    '.service.ts');
            });
        });
    };
    TemplatePrinter.prototype.printModule = function () {
        var _this = this;
        var template = this.getTemplate('module');
        if (template === '') {
            return;
        }
        ejs_8(template, {
            servicesList: this._printedServices.map(function (x) { return x + 'APIService'; })
        }, {}, function (err, str) {
            if (err) {
                _this._logger.err("[ ERROR ] EJS print MODULE error: " + err);
                return;
            }
            writeFile(resolve(_this.out + '/api.module.ts'), str, function (err) {
                if (err) {
                    _this._logger.err('[ ERROR ] file: ' + _this.out + '/api.module.ts');
                    return;
                }
                _this._logger.ok('[ OK    ] file: ' + _this.out + '/api.module.ts');
            });
        });
    };
    TemplatePrinter.prototype.printIndex = function () {
        var imports = "export * from './services';\nexport * from './models';\nexport { APIModule } from './api.module';\n";
        try {
            writeFileSync(resolve(this.out + '/index.ts'), imports);
        }
        catch (e) {
            this._logger.err('[ ERROR ] file: ' + this.out + '/index.ts');
        }
    };
    TemplatePrinter.prototype.printServiceIndex = function () {
        var imports = [];
        for (var _i = 0, _a = this._printedServices; _i < _a.length; _i++) {
            var item = _a[_i];
            imports.push("export { " + pascalCase(item) + "APIService, I" + pascalCase(item) + "APIService } from './" + paramCase(item) + ".service';");
        }
        imports.push('');
        try {
            writeFileSync(resolve(this.out + '/services/index.ts'), imports.join('\r\n'));
        }
        catch (e) {
            this._logger.err('[ ERROR ] file: ' + this.out + '/services/index.ts');
        }
    };
    TemplatePrinter.prototype.printModelIndex = function (models) {
        var imports = [];
        for (var _i = 0, models_2 = models; _i < models_2.length; _i++) {
            var item = models_2[_i];
            imports.push("export { " + item.name + " } from './" + paramCase(item.name).replace(/^i-/gi, '') + ".model';");
        }
        imports.push("export * from './enums';");
        imports.push('');
        try {
            writeFileSync(resolve(this.out + '/models/index.ts'), imports.join('\r\n'));
        }
        catch (e) {
            this._logger.err('[ ERROR ] file: ' + this.out + '/models/index.ts');
        }
    };
    TemplatePrinter.prototype.printEnumIndex = function (enums) {
        var imports = [];
        for (var _i = 0, enums_2 = enums; _i < enums_2.length; _i++) {
            var item = enums_2[_i];
            imports.push("export {" + item.name + "} from './" + paramCase(item.name) + ".enum';");
        }
        imports.push('');
        try {
            writeFileSync(resolve(this.out + '/models/enums/index.ts'), imports.join('\r\n'));
        }
        catch (e) {
            this._logger.err('[ ERROR ] file: ' + this.out + '/models/enums/index.ts');
        }
    };
    TemplatePrinter.prototype.getTemplate = function (type) {
        var template = '';
        if (this._templateFolder && existsSync(resolve(process.cwd(), this._templateFolder, type + ".ejs"))) {
            template = resolve(process.cwd(), this._templateFolder, type + ".ejs");
        }
        else if (existsSync(resolve(this._stdTemplateFolder, type + ".ejs"))) {
            template = resolve(this._stdTemplateFolder, type + ".ejs");
        }
        else if (existsSync(resolve(this._singleFileTemplateFolrder, type + ".ejs"))) {
            template = resolve(this._singleFileTemplateFolrder, type + ".ejs");
        }
        else {
            this._logger.err('[ ERROR ] template: not found!');
            return '';
        }
        return template;
    };
    return TemplatePrinter;
}());

var Generator = /** @class */ (function () {
    function Generator(config) {
        if (config === void 0) { config = null; }
        this.swagger = null;
        this.parser = new Parser();
        this.helper = new HelpCLI();
        this._logger = new Logger();
        this._printer = new TemplatePrinter();
        if (config) {
            this.config = config;
        }
        else {
            this.config = this.helper.parseArgs();
        }
        if (this.config.help) {
            this.helper.printHelp();
        }
        else {
            if (this.config.config !== '' && this.config.out !== '') {
                this.start();
            }
            else {
                this._logger.err('Params not set, see help and try again:');
                this.helper.printHelp();
            }
        }
    }
    Generator.prototype.start = function () {
        var _this = this;
        this.getConfig(this.config.config).then(function (res) {
            _this._logger.info('<Parsing Processed...>');
            _this._logger.ok(JSON.stringify(res));
            _this.parser.parse(res).then(function (res) {
                var _a, _b, _c, _d;
                _this._logger.ok('[ SUCCESS ]: Swagger JSON Parsed Successfull!');
                _this._logger.info('<Files Saving>');
                var extend = null;
                try {
                    extend = JSON.parse(readFileSync('./sw2ngx-extend.json', 'utf-8'));
                }
                catch (e) {
                    _this._logger.info('Not have extends');
                }
                if (extend) {
                    if (extend.enums) {
                        (_a = res[0]).push.apply(_a, extend.enums);
                    }
                    if (extend.models) {
                        (_b = res[1]).push.apply(_b, extend.models);
                    }
                    if (extend.services) {
                        for (var key in extend.services) {
                            if (extend.services[key]) {
                                if (res[2][key]) {
                                    if (extend.services[key].imports) {
                                        (_c = res[2][key].imports).push.apply(_c, extend.services[key].imports);
                                    }
                                    if (extend.services[key].methods) {
                                        (_d = res[2][key].methods).push.apply(_d, extend.services[key].methods);
                                    }
                                }
                                else {
                                    res[2][key] = extend.services[key];
                                }
                            }
                        }
                    }
                }
                // fs.writeFileSync(path.resolve('./result.json'), JSON.stringify({
                //     enums: res[0],
                //     models: res[1],
                //     services: res[2]
                // }));
                _this._printer.print(res[0], res[1], res[2], _this.config.out, _this.config.templateFolder).then(function () {
                    _this._logger.ok('[ SUCCESS ]: Generation API Module Successfull!');
                }, function (reject) {
                    console.log('end here');
                    _this._logger.err(JSON.stringify(reject));
                });
            }, function (err) {
                _this._logger.err(JSON.stringify(err));
            });
            // this._logger.info('<Create Swagger Map Object>');
        }, function (err) {
            _this._logger.err(JSON.stringify(err));
        });
    };
    Generator.prototype.getConfig = function (conf) {
        var _this = this;
        var promise = new Promise(function (resolve, reject) {
            if (/http(s?):\/\/\S/gi.test(conf)) {
                fetch(conf)
                    .then(function (res) {
                    resolve(res.json());
                })
                    .catch(function (err) {
                    _this._logger.err(err);
                    reject(err);
                });
            }
            else {
                _this.swagger = JSON.parse(readFileSync(conf, 'utf-8'));
                resolve(_this.swagger);
            }
        });
        return promise;
    };
    return Generator;
}());

// eslint-disable-next-line @typescript-eslint/no-unused-vars
var app = new Generator();

export default Generator;
//# sourceMappingURL=sw2ngx.es5.js.map
