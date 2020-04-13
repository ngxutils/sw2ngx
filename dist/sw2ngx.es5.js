import { pascalCase, paramCase } from 'change-case';
import { mkdirSync, writeFileSync, writeFile, existsSync, readdirSync, lstatSync, unlinkSync, rmdirSync, readFileSync } from 'fs';
import fetch from 'node-fetch';

var COLORS_HLP = {
    reset: "\x1b[0m",
    bright: "\x1b[1m",
    dim: "\x1b[2m",
    underscore: "\x1b[4m",
    blink: "\x1b[5m",
    reverse: "\x1b[7m",
    hidden: "\x1b[8m"
};
var COLORS_TXT = {
    black: "\x1b[30m",
    red: "\x1b[31m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    magenta: "\x1b[35m",
    cyan: "\x1b[36m",
    white: "\x1b[37m"
};
var COLORS_BG = {
    black: "\x1b[40m",
    red: "\x1b[41m",
    green: "\x1b[42m",
    yellow: "\x1b[43m",
    blue: "\x1b[44m",
    magenta: "\x1b[45m",
    cyan: "\x1b[46m",
    white: "\x1b[47m"
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
            // tslint:disable-next-line:no-switch-case-fall-through
            case 11:
                c += k.charCodeAt(offset + 10) << 16;
            // tslint:disable-next-line:no-switch-case-fall-through
            case 10:
                c += k.charCodeAt(offset + 9) << 8;
            // tslint:disable-next-line:no-switch-case-fall-through
            case 9:
                c += k.charCodeAt(offset + 8);
            // tslint:disable-next-line:no-switch-case-fall-through
            case 8:
                b += k.charCodeAt(offset + 7) << 24;
            // tslint:disable-next-line:no-switch-case-fall-through
            case 7:
                b += k.charCodeAt(offset + 6) << 16;
            // tslint:disable-next-line:no-switch-case-fall-through
            case 6:
                b += k.charCodeAt(offset + 5) << 8;
            // tslint:disable-next-line:no-switch-case-fall-through
            case 5:
                b += k.charCodeAt(offset + 4);
            // tslint:disable-next-line:no-switch-case-fall-through
            case 4:
                a += k.charCodeAt(offset + 3) << 24;
            // tslint:disable-next-line:no-switch-case-fall-through
            case 3:
                a += k.charCodeAt(offset + 2) << 16;
            // tslint:disable-next-line:no-switch-case-fall-through
            case 2:
                a += k.charCodeAt(offset + 1) << 8;
            // tslint:disable-next-line:no-switch-case-fall-through
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
        shingles.sort(this.hashComparator);
        if (shingles.length > this.maxFeatures)
            shingles = shingles.splice(this.maxFeatures);
        var simhash = 0x0;
        var mask = 0x1;
        for (var pos = 0; pos < 32; pos++) {
            var weight = 0;
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
            _this.parseModels(config).then(function (res) {
                _this._logger.info('models parsed');
                _this.parseServices(config).then(function (res) {
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
        return new Promise(function (resolve, reject) {
            for (var key in models) {
                var model = {
                    name: '',
                    description: '',
                    imports: [],
                    props: []
                };
                if (models.hasOwnProperty(key)) {
                    var imports = [];
                    model.name = 'I' + key;
                    model.description = models[key].description;
                    for (var prop in models[key].properties) {
                        if (models[key].properties.hasOwnProperty(prop)) {
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
        return new Promise(function (resolve, reject) {
            var result = {
                __common: {
                    uri: config.basePath,
                    imports: [],
                    methods: []
                }
            };
            for (var path in config.paths) {
                if (config.paths.hasOwnProperty(path)) {
                    for (var method in config.paths[path]) {
                        if (config.paths[path].hasOwnProperty(method)) {
                            _this._logger.ok(path);
                            var parsedMethod = _this.parseMethod(path, method, config.paths[path][method]);
                            if (result.hasOwnProperty(parsedMethod.tag)) {
                                result[parsedMethod.tag].methods.push(parsedMethod);
                            }
                            else {
                                result[parsedMethod.tag] = {
                                    uri: config.basePath,
                                    imports: [],
                                    methods: [parsedMethod]
                                };
                            }
                        }
                    }
                }
            }
            _this._servicesList = _this.resolveServiceImports(result);
            resolve(_this._servicesList);
        });
    };
    Parser.prototype.parseMethod = function (uri, type, method) {
        try {
            var tag_1 = this.parseParams(method.parameters, method.operationId);
        }
        catch (e) {
            console.error('params');
        }
        var tag = this.parseTags(method.tags);
        var params = this.parseParams(method.parameters, method.operationId);
        var resp = this.parseResponse(method.responses, method.operationId);
        return {
            uri: uri.replace(/\{/ig, '${'),
            type: type,
            tag: tag,
            name: method.operationId,
            description: method.summary,
            params: params,
            resp: resp
        };
    };
    Parser.prototype.resolveServiceImports = function (servicesList) {
        for (var serv in servicesList) {
            if (servicesList.hasOwnProperty(serv)) {
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
        for (var param in params) {
            if (params.hasOwnProperty(param)) {
                var type = null;
                this._logger.info(JSON.stringify(params[param]));
                var paramName = this.resolveParamName(params[param].name);
                this._logger.info(paramName);
                if (params[param].schema) {
                    this._logger.ok('type1');
                    type = this.resolveType(params[param].schema, paramName, method);
                }
                else {
                    this._logger.ok('type2');
                    type = this.resolveType(params[param], paramName, method);
                }
                var res = {
                    name: this.clearName(params[param].name),
                    queryName: paramName,
                    description: params[param].description ? params[param].description : '',
                    required: params[param].required ? true : false,
                    type: type
                };
                if (params[param].in === 'path') {
                    parsed.uri.push(res);
                }
                if (params[param].in === 'query') {
                    parsed.query.push(res);
                }
                if (params[param].in === 'body') {
                    parsed.payload.push(res);
                }
                if (params[param].in === 'formData') {
                    parsed.form.push(res);
                }
                parsed.all.push(res);
            }
        }
        return parsed;
    };
    Parser.prototype.clearName = function (name) {
        var baseTypes = [
            'number', 'string', 'boolean', 'any', 'array'
        ];
        var result = name.replace(/\.|\-/ig, '');
        if (baseTypes.indexOf(result) !== -1) {
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
                var resolvedType = { typeName: '', typeImport: '' };
                if (responses['200']['schema']['enum']) {
                    resolvedType.typeName = 'number';
                }
                else {
                    resolvedType = this.resolveType(responses['200']['schema'], 'response', method);
                }
                if (resolvedType.typeName === '') {
                    return [{
                            typeName: 'any',
                            typeImport: null
                        }];
                }
                else {
                    if (resolvedType.typeImport !== '') {
                        return [resolvedType];
                    }
                    else {
                        return [{
                                typeName: resolvedType.typeName,
                                typeImport: null
                            }];
                    }
                }
            }
            else {
                return [{
                        typeName: 'any',
                        typeImport: null
                    }];
            }
        }
        else {
            return [{
                    typeName: 'any',
                    typeImport: null
                }];
        }
    };
    Parser.prototype.resolveImports = function (imports) {
        var result = [];
        for (var _i = 0, imports_1 = imports; _i < imports_1.length; _i++) {
            var imp = imports_1[_i];
            if (result.indexOf(imp) === -1) {
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
        var curname = name.replace(/\.|\-/ig, '_');
        if (prop === undefined) {
            return {
                typeName: 'any',
                typeImport: null
            };
        }
        if ((!prop.enum) && (!prop.format)) {
            if (prop.$ref !== undefined) {
                var temp = prop.$ref.split('/');
                return {
                    typeName: 'I' + temp[temp.length - 1],
                    typeImport: 'I' + temp[temp.length - 1]
                };
            }
            if ((prop.type === 'boolean') ||
                (prop.type === 'string') ||
                (prop.type === 'number')) {
                return {
                    typeName: prop.type,
                    typeImport: null
                };
            }
            if (prop.type === 'array') {
                if (prop.items) {
                    var temp = this.resolveType(prop.items, curname, parent);
                    return {
                        typeName: temp.typeName + "[]",
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
        var extact = this.extractEnums(description ? description : '', evalue, curname);
        //  this._logger.err(JSON.stringify({description, evalue, curname, parent}))
        if (extact === null) {
            return {
                typeName: evalue.join(' | '),
                typeImport: null
            };
        }
        var withParentName = "" + pascalCase(paramCase(parent).replace(/^i\-/ig, '') + '-' + paramCase(curname + 'Set'));
        var propEnum = {
            name: pascalCase(curname) + "Set",
            modelName: parent,
            value: extact,
            hash: hashName.toString(16)
        };
        var duplicate = this._enums.filter(function (x) { return x.name.replace(/\d+$/ig, '') === propEnum.name; });
        var extDuplicate = this._enums.filter(function (x) { return x.name.replace(/\d+$/ig, '') === withParentName; });
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
    Parser.prototype.extractEnums = function (description, propEnum, name) {
        var result = [];
        var indexOf = description.search(/\(\d/ig);
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
        }
        else {
            return null;
        }
        return result;
    };
    return Parser;
}());

var GeneratorParams = [
    {
        name: 'config',
        keys: ['-c', '--c'],
        noValue: false,
        description: 'Swagger doc path'
    },
    {
        name: 'out',
        keys: ['-o', '--o'],
        noValue: false,
        description: 'Output directory'
    },
    {
        name: 'help',
        keys: [
            '-h', '--h', 'help', '-help'
        ],
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
            help: false
        };
        var args = process.argv;
        for (var i = 0; i < args.length; i++) {
            for (var _i = 0, GeneratorParams_1 = GeneratorParams; _i < GeneratorParams_1.length; _i++) {
                var param = GeneratorParams_1[_i];
                if (param.keys.indexOf(args[i]) !== -1) {
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
            this.logger.write(line)
                .fg('yellow');
            line = args.join('');
            line = line.substr(0, 20);
            this.logger.write(line)
                .reset();
            line = '     ' + key.description;
            this.logger.write(line);
            this.logger.writeln('');
        }
    };
    return HelpCLI;
}());

var ModuleTemplate = /** @class */ (function () {
    function ModuleTemplate() {
    }
    ModuleTemplate.prototype.compile = function (value) {
        var servicesList = [];
        for (var _i = 0, value_1 = value; _i < value_1.length; _i++) {
            var el = value_1[_i];
            servicesList.push(el + "APIService,");
        }
        var importsHead = servicesList.join('\r\n\t');
        var importsBody = servicesList.join('\r\n\t\t\t\t');
        return "\nimport { NgModule, ModuleWithProviders } from '@angular/core';\nimport { HttpClientModule } from '@angular/common/http';\nimport {\n  " + importsHead + "\n} from './services';\n\n@NgModule({\n  imports: [\n    HttpClientModule\n  ],\n  exports: [],\n  declarations: [],\n  providers: [\n  ],\n})\nexport class APIModule {\n  public static forRoot(): ModuleWithProviders {\n    return {\n      ngModule: APIModule,\n      providers: [\n        " + importsBody + "\n      ],\n    };\n  }\n}\n";
    };
    return ModuleTemplate;
}());

var ServiceTemplate = /** @class */ (function () {
    function ServiceTemplate() {
    }
    ServiceTemplate.prototype.imports = function (imp) {
        var imports = [];
        if (imp.length === 0) {
            return '';
        }
        imports.push("import {");
        for (var _i = 0, imp_1 = imp; _i < imp_1.length; _i++) {
            var item = imp_1[_i];
            imports.push(item + ",");
        }
        imports.push("} from '../models';");
        return imports.join('\r\n');
    };
    ServiceTemplate.prototype.methodDescription = function (method) {
        var temp = [];
        temp.push("\n    /**\n     * @method\n     * @name  " + method.name + "\n     * @description" + (method.description ? method.description.replace('\r\n', '') : '') + "\r\n");
        for (var _i = 0, _a = method.params.all; _i < _a.length; _i++) {
            var param = _a[_i];
            temp.push("     * @param {" + param.type.typeName + "} " + param.name + "\r\n");
        }
        temp.push("     */");
        return temp.join('');
    };
    ServiceTemplate.prototype.methodParams = function (method, isInterface) {
        var temp = [];
        for (var _i = 0, _a = method.params.all; _i < _a.length; _i++) {
            var param = _a[_i];
            if (!isInterface) {
                if (param.default) {
                    temp.push(param.name + ": " + param.type.typeName + " = '" + param.default + "'");
                }
                else {
                    temp.push(param.name + ": " + param.type.typeName + (param.required ? '' : ' = null'));
                }
            }
            else {
                temp.push("" + param.name + (param.required ? '' : '?') + ": " + param.type.typeName);
            }
        }
        return temp.join(', ');
    };
    ServiceTemplate.prototype.methodBody = function (method) {
        var temp = [];
        if (method.params.query.length > 0) {
            temp.push("\n        let paramString = '';");
            var isFirst = true;
            for (var _i = 0, _a = method.params.query; _i < _a.length; _i++) {
                var param = _a[_i];
                temp.push("\n        if ((" + param.name + " !== undefined) && (" + param.name + " !== null)) {\n            paramString += '" + (isFirst ? '' : '&') + param.queryName + "=' + encodeURIComponent(" + param.name + (param.type.typeName === 'Date' ? '.toISOString()' : '.toString()') + ");\n        }" + (param.required ? " else { throw new Error('Required param(" + param.name + ") not set!'); }" : ''));
                isFirst = false;
            }
            temp.push("\n        options.params = new HttpParams({fromString: paramString});");
        }
        if ((method.type === 'post') || (method.type === 'put')) {
            if (method.params.form.length !== 0) {
                temp.push("\n        options.headers = new HttpHeaders();\n        options.headers.delete('Content-Type');\n        const form = new FormData();");
                for (var _b = 0, _c = method.params.form; _b < _c.length; _b++) {
                    var param = _c[_b];
                    if (param.type.typeName === 'any') {
                        temp.push("\n        form.append('" + param.queryName + "', " + param.name + ");");
                    }
                    else {
                        temp.push("\n        form.append('" + param.queryName + "', JSON.stringify(" + param.name + "));");
                    }
                }
                temp.push("\n        return this.http." + method.type + "<" + method.resp[0].typeName + ">(this.uri + `" + method.uri + "`, form, options);");
            }
            else {
                if (method.params.urlencoded.length !== 0) {
                    temp.push("\n        let payload = '';\n        options.headers = new HttpHeaders({'Content-Type': 'application/x-www-form-urlencoded'});");
                    var isFirst = true;
                    for (var _d = 0, _e = method.params.urlencoded; _d < _e.length; _d++) {
                        var param = _e[_d];
                        temp.push("\n        if ((" + param.name + " !== undefined) && (" + param.name + " !== null)) {\n            payload += '" + (isFirst ? '' : '&') + param.queryName + "=' + encodeURIComponent(" + param.name + (param.type.typeName === 'Date' ? '.toISOString()' : '.toString()') + ");\n        }" + (param.required ? " else { throw new Error('Required param(" + param.name + ") not set!'); }" : ''));
                        isFirst = false;
                    }
                    temp.push("\n        return this.http." + method.type + "<" + method.resp[0].typeName + ">(this.uri + `" + method.uri + "`, payload, options);");
                }
                else {
                    temp.push("\n        // tslint:disable-next-line:prefer-const\n        let payload = {};\n        options.headers = new HttpHeaders({'Content-Type': 'application/json; charset=utf-8'});");
                    if (method.params.payload.length > 1) {
                        for (var _f = 0, _g = method.params.payload; _f < _g.length; _f++) {
                            var param = _g[_f];
                            temp.push("\n        payload['" + param.queryName + "'] = " + param.name + ";");
                        }
                    }
                    else {
                        if (method.params.payload.length > 0) {
                            temp.push("\n        payload = " + method.params.payload[0].name + ";");
                        }
                    }
                    temp.push("\n        return this.http." + method.type + "<" + method.resp[0].typeName + ">(this.uri + `" + method.uri + "`, JSON.stringify(payload), options);");
                }
            }
        }
        if ((method.type === 'get') || (method.type === 'delete')) {
            temp.push("\n        return this.http." + method.type + "<" + method.resp[0].typeName + ">(this.uri + `" + method.uri + "`" + (method.params.query.length !== 0 ? ', options' : '') + ");");
        }
        return temp.join('\r\n');
    };
    ServiceTemplate.prototype.body = function (methods) {
        var interBody = [];
        var serviceBody = [];
        for (var _i = 0, methods_1 = methods; _i < methods_1.length; _i++) {
            var method = methods_1[_i];
            interBody.push(this.methodDescription(method) + "\n    " + method.name + "(" + this.methodParams(method, true) + "): Observable<" + method.resp[0].typeName + ">;");
            serviceBody.push("\tpublic " + method.name + "(" + this.methodParams(method, false) + "): Observable<" + method.resp[0].typeName + "> {\n        const options = {\n            headers: new HttpHeaders(),\n            params: new HttpParams()\n        };\n" + this.methodBody(method) + "\n    }");
        }
        return { interfaceBody: interBody.join('\r\n'), serviceBody: serviceBody.join('\r\n') };
    };
    ServiceTemplate.prototype.compile = function (value, name) {
        if (value.methods.length > 0) {
            var imports = this.imports(value.imports);
            var _a = this.body(value.methods), interfaceBody = _a.interfaceBody, serviceBody = _a.serviceBody;
            return "import { Injectable } from '@angular/core';\nimport { Subject, Observable } from 'rxjs';\nimport { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';\n" + imports + "\nexport interface I" + name + "APIService {\n" + interfaceBody + "\n}\n\n@Injectable()\nexport class " + name + "APIService implements I" + name + "APIService {\n  public serviceName: string;\n  public uri: string;\n  constructor(\n    public http: HttpClient) {\n    this.serviceName = '" + name + "API';\n    this.uri = '" + value.uri + "';\n  }\n" + serviceBody + "\n}\r\n";
        }
        else {
            return '';
        }
    };
    return ServiceTemplate;
}());

var EnumTemplate = /** @class */ (function () {
    function EnumTemplate() {
    }
    EnumTemplate.prototype.body = function (value) {
        var temp = [];
        for (var _i = 0, _a = value.value; _i < _a.length; _i++) {
            var param = _a[_i];
            temp.push(param.key + "= " + (parseInt(param.val.toString(), 10).toString() !== 'NaN' ? param.val : '"' + param.val + '"'));
        }
        return temp.join(',\r\n\t');
    };
    EnumTemplate.prototype.compile = function (value) {
        return "\nexport enum " + value.name + " {\n  " + this.body(value) + "\n}\n";
    };
    return EnumTemplate;
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
}function filter (xs, f) {
    if (xs.filter) return xs.filter(f);
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        if (f(xs[i], i, xs)) res.push(xs[i]);
    }
    return res;
}

var ModelTemplate = /** @class */ (function () {
    function ModelTemplate() {
    }
    ModelTemplate.prototype.modelImports = function (modelImports, name) {
        var imports = [];
        if (modelImports.length === 0) {
            return '';
        }
        imports.push("import {");
        for (var _i = 0, modelImports_1 = modelImports; _i < modelImports_1.length; _i++) {
            var item = modelImports_1[_i];
            if (item !== name) {
                imports.push(item + ",");
            }
        }
        imports.push("} from './';");
        return imports.join('\r\n');
    };
    ModelTemplate.prototype.body = function (value) {
        var itemp = [];
        var temp = [];
        for (var _i = 0, value_1 = value; _i < value_1.length; _i++) {
            var param = value_1[_i];
            if (param.description) {
                itemp.push("/* " + param.description + " */");
            }
            itemp.push(param.name + " : " + param.type + ";");
            temp.push("public " + param.name + ": " + param.type + ";");
        }
        return {
            iprop: itemp.join('\r\n\t'),
            prop: temp.join('\r\n\t')
        };
    };
    ModelTemplate.prototype.compile = function (value) {
        var _a = this.body(value.props), iprop = _a.iprop, prop = _a.prop;
        return "\n" + this.modelImports(value.imports, value.name) + "\n\nexport interface " + value.name + " {\n  " + iprop + "\n}\n";
    };
    return ModelTemplate;
}());

var TemplatePrinter = /** @class */ (function () {
    function TemplatePrinter() {
        this.out = '';
        this.enumCompiler = new EnumTemplate();
        this.modelCompiler = new ModelTemplate();
        this.serviceCompiler = new ServiceTemplate();
        this.moduleCompiler = new ModuleTemplate();
        this._printedServices = [];
        this._logger = new Logger();
    }
    TemplatePrinter.prototype.cleanFolder = function () {
        var _this = this;
        this._logger.info('clean start');
        return new Promise(function (resolve$1, reject) {
            var deleteFolderRecursive = function (path) {
                if (existsSync(path)) {
                    readdirSync(path).forEach(function (file, index) {
                        var curPath = path + "/" + file;
                        if (lstatSync(curPath).isDirectory()) { // recurse
                            deleteFolderRecursive(curPath);
                        }
                        else { // delete file
                            unlinkSync(curPath);
                        }
                    });
                    rmdirSync(path);
                }
            };
            try {
                deleteFolderRecursive(resolve(_this.out));
                resolve$1();
            }
            catch (e) {
                reject(e);
            }
        });
    };
    TemplatePrinter.prototype.createFolders = function () {
        var _this = this;
        return new Promise(function (resolve$1, reject) {
            mkdirSync(resolve(_this.out));
            mkdirSync(resolve(_this.out + '/models'));
            mkdirSync(resolve(_this.out + '/models/enums'));
            mkdirSync(resolve(_this.out + '/services'));
            resolve$1();
        });
    };
    TemplatePrinter.prototype.print = function (enums, models, services, out) {
        var _this = this;
        this.out = out;
        return new Promise(function (resolve, reject) {
            _this.createFolders().then(function () {
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
                    if (services.hasOwnProperty(name_1)) {
                        _this.printService(services[name_1], name_1);
                    }
                }
                _this.printServiceIndex();
                _this.printModule();
                _this.printIndex();
                resolve();
            });
        });
    };
    TemplatePrinter.prototype.printEnum = function (value) {
        var compiled = this.enumCompiler.compile(value);
        // this._logger.ok(path.resolve(this.out + '/models/enums/' + value.name + '.enum.ts'));
        try {
            writeFileSync(resolve(this.out + '/models/enums/' + paramCase(value.name) + '.enum.ts'), compiled);
        }
        catch (e) {
            this._logger.err('[ ERROR ] file: ' + this.out + '/models/enums/' + value.name + '.enum.ts');
        }
    };
    TemplatePrinter.prototype.printModel = function (model) {
        var _this = this;
        var compiled = this.modelCompiler.compile(model);
        /// this._logger.ok(path.resolve(this.out + '/models/' + model.name + '.model.ts'));
        writeFile(resolve(this.out + '/models/' + paramCase(model.name).replace(/^i\-/ig, '') + '.model.ts'), compiled, function (err) {
            if (err) {
                _this._logger.err('[ ERROR ] file: ' + _this.out + '/models/' + model.name + '.model.ts');
                return;
            }
            _this._logger.ok('[ OK    ] file: ' + _this.out + '/models/' + model.name + '.model.ts');
        });
    };
    TemplatePrinter.prototype.printService = function (service, name) {
        var _this = this;
        var compiled = this.serviceCompiler.compile(service, name);
        if (compiled !== '') {
            this._printedServices.push(name);
            writeFile(resolve(this.out + '/services/' + paramCase(name) + '.service.ts'), compiled, function (err) {
                if (err) {
                    _this._logger.err('[ ERROR ] file: ' + _this.out + '/services/' + name + '.service.ts');
                    return;
                }
                _this._logger.ok('[ OK    ] file: ' + _this.out + '/services/' + name + '.service.ts');
            });
        }
    };
    TemplatePrinter.prototype.printModule = function () {
        var _this = this;
        var compiled = this.moduleCompiler.compile(this._printedServices);
        writeFile(resolve(this.out + '/api.module.ts'), compiled, function (err) {
            if (err) {
                _this._logger.err('[ ERROR ] file: ' + _this.out + '/api.module.ts');
                return;
            }
            _this._logger.ok('[ OK    ] file: ' + _this.out + '/api.module.ts');
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
            imports.push("export { " + item + "APIService, I" + item + "APIService } from './" + paramCase(item) + ".service';");
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
            imports.push("export { " + item.name + " } from './" + paramCase(item.name).replace(/^i\-/ig, '') + ".model';");
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
            if (this.config.config !== "" && this.config.out !== "") {
                this.start();
            }
            else {
                this._logger.err("Params not set, see help and try again:");
                this.helper.printHelp();
            }
        }
    }
    Generator.prototype.start = function () {
        var _this = this;
        this.getConfig(this.config.config).then(function (res) {
            _this._logger.info("<Parsing Processed...>");
            _this._logger.ok(JSON.stringify(res));
            _this.parser.parse(res).then(function (res) {
                var _a, _b, _c, _d;
                _this._logger.ok("[ SUCCESS ]: Swagger JSON Parsed Successfull!");
                _this._logger.info("<Files Saving>");
                var extend = null;
                try {
                    extend = JSON.parse(readFileSync("./sw2ngx-extend.json", "utf-8"));
                }
                catch (e) {
                    _this._logger.info("Not have extends");
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
                            if (extend.services.hasOwnProperty(key)) {
                                if (res[2].hasOwnProperty(key)) {
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
                _this._printer.print(res[0], res[1], res[2], _this.config.out).then(function () {
                    _this._logger.ok("[ SUCCESS ]: Generation API Module Successfull!");
                }, function (reject) {
                    console.log("end here");
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
            if (/http(s?)\:\/\/\S/gi.test(conf)) {
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
                _this.swagger = JSON.parse(readFileSync(conf, "utf-8"));
                resolve(_this.swagger);
            }
        });
        return promise;
    };
    return Generator;
}());

var app = new Generator();

export default Generator;
//# sourceMappingURL=sw2ngx.es5.js.map
