(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('fs'), require('request'), require('path')) :
    typeof define === 'function' && define.amd ? define(['fs', 'request', 'path'], factory) :
    (global = global || self, global.sw2ngx = factory(global.fs, global.request, global.path));
}(this, function (fs, request, path) { 'use strict';

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
                        model.name = key;
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
                        typeName: temp[temp.length - 1],
                        typeImport: temp[temp.length - 1]
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
            var hashName = this._simHash.hash(parent + "_" + curname + "Set");
            // this._logger.ok(`${parent}_${curname}Set: ${hashName.toString(16)}`);
            // this._logger.err(hashName);
            var extact = this.extractEnums(description ? description : '', evalue, curname);
            //  this._logger.err(JSON.stringify({description, evalue, curname, parent}))
            var propEnum = {
                name: parent + "_" + curname + "Set",
                modelName: parent,
                value: extact,
                hash: hashName.toString(16)
            };
            for (var _i = 0, _a = this._enums; _i < _a.length; _i++) {
                var item = _a[_i];
                if (item.hash === propEnum.hash) {
                    return {
                        typeName: propEnum.name,
                        typeImport: propEnum.name
                    };
                }
            }
            this._enums.push(propEnum);
            return {
                typeName: propEnum.name,
                typeImport: propEnum.name
            };
        };
        Parser.prototype.extractEnums = function (description, propEnum, name) {
            if (name === void 0) { name = 'enum'; }
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
                for (var key in propEnum) {
                    if (propEnum.hasOwnProperty(key)) {
                        result.push({
                            key: name + propEnum[key],
                            val: propEnum[key]
                        });
                    }
                }
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
            return "\n" + this.modelImports(value.imports, value.name) + "\n\nexport interface I" + value.name + " {\n  " + iprop + "\n}\n\nexport class " + value.name + " implements I" + value.name + " {\n  " + prop + "\n}\n";
        };
        return ModelTemplate;
    }());

    function createCommonjsModule(fn, module) {
    	return module = { exports: {} }, fn(module, module.exports), module.exports;
    }

    /**
     * Special language-specific overrides.
     *
     * Source: ftp://ftp.unicode.org/Public/UCD/latest/ucd/SpecialCasing.txt
     *
     * @type {Object}
     */
    var LANGUAGES = {
      tr: {
        regexp: /\u0130|\u0049|\u0049\u0307/g,
        map: {
          '\u0130': '\u0069',
          '\u0049': '\u0131',
          '\u0049\u0307': '\u0069'
        }
      },
      az: {
        regexp: /[\u0130]/g,
        map: {
          '\u0130': '\u0069',
          '\u0049': '\u0131',
          '\u0049\u0307': '\u0069'
        }
      },
      lt: {
        regexp: /[\u0049\u004A\u012E\u00CC\u00CD\u0128]/g,
        map: {
          '\u0049': '\u0069\u0307',
          '\u004A': '\u006A\u0307',
          '\u012E': '\u012F\u0307',
          '\u00CC': '\u0069\u0307\u0300',
          '\u00CD': '\u0069\u0307\u0301',
          '\u0128': '\u0069\u0307\u0303'
        }
      }
    };

    /**
     * Lowercase a string.
     *
     * @param  {String} str
     * @return {String}
     */
    var lowerCase = function (str, locale) {
      var lang = LANGUAGES[locale];

      str = str == null ? '' : String(str);

      if (lang) {
        str = str.replace(lang.regexp, function (m) { return lang.map[m] });
      }

      return str.toLowerCase()
    };

    var nonWordRegexp = /[^A-Za-z\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u052F\u0531-\u0556\u0559\u0561-\u0587\u05D0-\u05EA\u05F0-\u05F2\u0620-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u08A0-\u08B4\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971-\u0980\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0AF9\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D\u0C58-\u0C5A\u0C60\u0C61\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDE\u0CE0\u0CE1\u0CF1\u0CF2\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D5F-\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F5\u13F8-\u13FD\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16F1-\u16F8\u1700-\u170C\u170E-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u1820-\u1877\u1880-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191E\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u1A00-\u1A16\u1A20-\u1A54\u1AA7\u1B05-\u1B33\u1B45-\u1B4B\u1B83-\u1BA0\u1BAE\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1CE9-\u1CEC\u1CEE-\u1CF1\u1CF5\u1CF6\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2183\u2184\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2E2F\u3005\u3006\u3031-\u3035\u303B\u303C\u3041-\u3096\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FD5\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A\uA62B\uA640-\uA66E\uA67F-\uA69D\uA6A0-\uA6E5\uA717-\uA71F\uA722-\uA788\uA78B-\uA7AD\uA7B0-\uA7B7\uA7F7-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA8FD\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF\uA9E0-\uA9E4\uA9E6-\uA9EF\uA9FA-\uA9FE\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA76\uAA7A\uAA7E-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB65\uAB70-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC0-9\xB2\xB3\xB9\xBC-\xBE\u0660-\u0669\u06F0-\u06F9\u07C0-\u07C9\u0966-\u096F\u09E6-\u09EF\u09F4-\u09F9\u0A66-\u0A6F\u0AE6-\u0AEF\u0B66-\u0B6F\u0B72-\u0B77\u0BE6-\u0BF2\u0C66-\u0C6F\u0C78-\u0C7E\u0CE6-\u0CEF\u0D66-\u0D75\u0DE6-\u0DEF\u0E50-\u0E59\u0ED0-\u0ED9\u0F20-\u0F33\u1040-\u1049\u1090-\u1099\u1369-\u137C\u16EE-\u16F0\u17E0-\u17E9\u17F0-\u17F9\u1810-\u1819\u1946-\u194F\u19D0-\u19DA\u1A80-\u1A89\u1A90-\u1A99\u1B50-\u1B59\u1BB0-\u1BB9\u1C40-\u1C49\u1C50-\u1C59\u2070\u2074-\u2079\u2080-\u2089\u2150-\u2182\u2185-\u2189\u2460-\u249B\u24EA-\u24FF\u2776-\u2793\u2CFD\u3007\u3021-\u3029\u3038-\u303A\u3192-\u3195\u3220-\u3229\u3248-\u324F\u3251-\u325F\u3280-\u3289\u32B1-\u32BF\uA620-\uA629\uA6E6-\uA6EF\uA830-\uA835\uA8D0-\uA8D9\uA900-\uA909\uA9D0-\uA9D9\uA9F0-\uA9F9\uAA50-\uAA59\uABF0-\uABF9\uFF10-\uFF19]+/g;

    var camelCaseRegexp = /([a-z\xB5\xDF-\xF6\xF8-\xFF\u0101\u0103\u0105\u0107\u0109\u010B\u010D\u010F\u0111\u0113\u0115\u0117\u0119\u011B\u011D\u011F\u0121\u0123\u0125\u0127\u0129\u012B\u012D\u012F\u0131\u0133\u0135\u0137\u0138\u013A\u013C\u013E\u0140\u0142\u0144\u0146\u0148\u0149\u014B\u014D\u014F\u0151\u0153\u0155\u0157\u0159\u015B\u015D\u015F\u0161\u0163\u0165\u0167\u0169\u016B\u016D\u016F\u0171\u0173\u0175\u0177\u017A\u017C\u017E-\u0180\u0183\u0185\u0188\u018C\u018D\u0192\u0195\u0199-\u019B\u019E\u01A1\u01A3\u01A5\u01A8\u01AA\u01AB\u01AD\u01B0\u01B4\u01B6\u01B9\u01BA\u01BD-\u01BF\u01C6\u01C9\u01CC\u01CE\u01D0\u01D2\u01D4\u01D6\u01D8\u01DA\u01DC\u01DD\u01DF\u01E1\u01E3\u01E5\u01E7\u01E9\u01EB\u01ED\u01EF\u01F0\u01F3\u01F5\u01F9\u01FB\u01FD\u01FF\u0201\u0203\u0205\u0207\u0209\u020B\u020D\u020F\u0211\u0213\u0215\u0217\u0219\u021B\u021D\u021F\u0221\u0223\u0225\u0227\u0229\u022B\u022D\u022F\u0231\u0233-\u0239\u023C\u023F\u0240\u0242\u0247\u0249\u024B\u024D\u024F-\u0293\u0295-\u02AF\u0371\u0373\u0377\u037B-\u037D\u0390\u03AC-\u03CE\u03D0\u03D1\u03D5-\u03D7\u03D9\u03DB\u03DD\u03DF\u03E1\u03E3\u03E5\u03E7\u03E9\u03EB\u03ED\u03EF-\u03F3\u03F5\u03F8\u03FB\u03FC\u0430-\u045F\u0461\u0463\u0465\u0467\u0469\u046B\u046D\u046F\u0471\u0473\u0475\u0477\u0479\u047B\u047D\u047F\u0481\u048B\u048D\u048F\u0491\u0493\u0495\u0497\u0499\u049B\u049D\u049F\u04A1\u04A3\u04A5\u04A7\u04A9\u04AB\u04AD\u04AF\u04B1\u04B3\u04B5\u04B7\u04B9\u04BB\u04BD\u04BF\u04C2\u04C4\u04C6\u04C8\u04CA\u04CC\u04CE\u04CF\u04D1\u04D3\u04D5\u04D7\u04D9\u04DB\u04DD\u04DF\u04E1\u04E3\u04E5\u04E7\u04E9\u04EB\u04ED\u04EF\u04F1\u04F3\u04F5\u04F7\u04F9\u04FB\u04FD\u04FF\u0501\u0503\u0505\u0507\u0509\u050B\u050D\u050F\u0511\u0513\u0515\u0517\u0519\u051B\u051D\u051F\u0521\u0523\u0525\u0527\u0529\u052B\u052D\u052F\u0561-\u0587\u13F8-\u13FD\u1D00-\u1D2B\u1D6B-\u1D77\u1D79-\u1D9A\u1E01\u1E03\u1E05\u1E07\u1E09\u1E0B\u1E0D\u1E0F\u1E11\u1E13\u1E15\u1E17\u1E19\u1E1B\u1E1D\u1E1F\u1E21\u1E23\u1E25\u1E27\u1E29\u1E2B\u1E2D\u1E2F\u1E31\u1E33\u1E35\u1E37\u1E39\u1E3B\u1E3D\u1E3F\u1E41\u1E43\u1E45\u1E47\u1E49\u1E4B\u1E4D\u1E4F\u1E51\u1E53\u1E55\u1E57\u1E59\u1E5B\u1E5D\u1E5F\u1E61\u1E63\u1E65\u1E67\u1E69\u1E6B\u1E6D\u1E6F\u1E71\u1E73\u1E75\u1E77\u1E79\u1E7B\u1E7D\u1E7F\u1E81\u1E83\u1E85\u1E87\u1E89\u1E8B\u1E8D\u1E8F\u1E91\u1E93\u1E95-\u1E9D\u1E9F\u1EA1\u1EA3\u1EA5\u1EA7\u1EA9\u1EAB\u1EAD\u1EAF\u1EB1\u1EB3\u1EB5\u1EB7\u1EB9\u1EBB\u1EBD\u1EBF\u1EC1\u1EC3\u1EC5\u1EC7\u1EC9\u1ECB\u1ECD\u1ECF\u1ED1\u1ED3\u1ED5\u1ED7\u1ED9\u1EDB\u1EDD\u1EDF\u1EE1\u1EE3\u1EE5\u1EE7\u1EE9\u1EEB\u1EED\u1EEF\u1EF1\u1EF3\u1EF5\u1EF7\u1EF9\u1EFB\u1EFD\u1EFF-\u1F07\u1F10-\u1F15\u1F20-\u1F27\u1F30-\u1F37\u1F40-\u1F45\u1F50-\u1F57\u1F60-\u1F67\u1F70-\u1F7D\u1F80-\u1F87\u1F90-\u1F97\u1FA0-\u1FA7\u1FB0-\u1FB4\u1FB6\u1FB7\u1FBE\u1FC2-\u1FC4\u1FC6\u1FC7\u1FD0-\u1FD3\u1FD6\u1FD7\u1FE0-\u1FE7\u1FF2-\u1FF4\u1FF6\u1FF7\u210A\u210E\u210F\u2113\u212F\u2134\u2139\u213C\u213D\u2146-\u2149\u214E\u2184\u2C30-\u2C5E\u2C61\u2C65\u2C66\u2C68\u2C6A\u2C6C\u2C71\u2C73\u2C74\u2C76-\u2C7B\u2C81\u2C83\u2C85\u2C87\u2C89\u2C8B\u2C8D\u2C8F\u2C91\u2C93\u2C95\u2C97\u2C99\u2C9B\u2C9D\u2C9F\u2CA1\u2CA3\u2CA5\u2CA7\u2CA9\u2CAB\u2CAD\u2CAF\u2CB1\u2CB3\u2CB5\u2CB7\u2CB9\u2CBB\u2CBD\u2CBF\u2CC1\u2CC3\u2CC5\u2CC7\u2CC9\u2CCB\u2CCD\u2CCF\u2CD1\u2CD3\u2CD5\u2CD7\u2CD9\u2CDB\u2CDD\u2CDF\u2CE1\u2CE3\u2CE4\u2CEC\u2CEE\u2CF3\u2D00-\u2D25\u2D27\u2D2D\uA641\uA643\uA645\uA647\uA649\uA64B\uA64D\uA64F\uA651\uA653\uA655\uA657\uA659\uA65B\uA65D\uA65F\uA661\uA663\uA665\uA667\uA669\uA66B\uA66D\uA681\uA683\uA685\uA687\uA689\uA68B\uA68D\uA68F\uA691\uA693\uA695\uA697\uA699\uA69B\uA723\uA725\uA727\uA729\uA72B\uA72D\uA72F-\uA731\uA733\uA735\uA737\uA739\uA73B\uA73D\uA73F\uA741\uA743\uA745\uA747\uA749\uA74B\uA74D\uA74F\uA751\uA753\uA755\uA757\uA759\uA75B\uA75D\uA75F\uA761\uA763\uA765\uA767\uA769\uA76B\uA76D\uA76F\uA771-\uA778\uA77A\uA77C\uA77F\uA781\uA783\uA785\uA787\uA78C\uA78E\uA791\uA793-\uA795\uA797\uA799\uA79B\uA79D\uA79F\uA7A1\uA7A3\uA7A5\uA7A7\uA7A9\uA7B5\uA7B7\uA7FA\uAB30-\uAB5A\uAB60-\uAB65\uAB70-\uABBF\uFB00-\uFB06\uFB13-\uFB17\uFF41-\uFF5A0-9\xB2\xB3\xB9\xBC-\xBE\u0660-\u0669\u06F0-\u06F9\u07C0-\u07C9\u0966-\u096F\u09E6-\u09EF\u09F4-\u09F9\u0A66-\u0A6F\u0AE6-\u0AEF\u0B66-\u0B6F\u0B72-\u0B77\u0BE6-\u0BF2\u0C66-\u0C6F\u0C78-\u0C7E\u0CE6-\u0CEF\u0D66-\u0D75\u0DE6-\u0DEF\u0E50-\u0E59\u0ED0-\u0ED9\u0F20-\u0F33\u1040-\u1049\u1090-\u1099\u1369-\u137C\u16EE-\u16F0\u17E0-\u17E9\u17F0-\u17F9\u1810-\u1819\u1946-\u194F\u19D0-\u19DA\u1A80-\u1A89\u1A90-\u1A99\u1B50-\u1B59\u1BB0-\u1BB9\u1C40-\u1C49\u1C50-\u1C59\u2070\u2074-\u2079\u2080-\u2089\u2150-\u2182\u2185-\u2189\u2460-\u249B\u24EA-\u24FF\u2776-\u2793\u2CFD\u3007\u3021-\u3029\u3038-\u303A\u3192-\u3195\u3220-\u3229\u3248-\u324F\u3251-\u325F\u3280-\u3289\u32B1-\u32BF\uA620-\uA629\uA6E6-\uA6EF\uA830-\uA835\uA8D0-\uA8D9\uA900-\uA909\uA9D0-\uA9D9\uA9F0-\uA9F9\uAA50-\uAA59\uABF0-\uABF9\uFF10-\uFF19])([A-Z\xC0-\xD6\xD8-\xDE\u0100\u0102\u0104\u0106\u0108\u010A\u010C\u010E\u0110\u0112\u0114\u0116\u0118\u011A\u011C\u011E\u0120\u0122\u0124\u0126\u0128\u012A\u012C\u012E\u0130\u0132\u0134\u0136\u0139\u013B\u013D\u013F\u0141\u0143\u0145\u0147\u014A\u014C\u014E\u0150\u0152\u0154\u0156\u0158\u015A\u015C\u015E\u0160\u0162\u0164\u0166\u0168\u016A\u016C\u016E\u0170\u0172\u0174\u0176\u0178\u0179\u017B\u017D\u0181\u0182\u0184\u0186\u0187\u0189-\u018B\u018E-\u0191\u0193\u0194\u0196-\u0198\u019C\u019D\u019F\u01A0\u01A2\u01A4\u01A6\u01A7\u01A9\u01AC\u01AE\u01AF\u01B1-\u01B3\u01B5\u01B7\u01B8\u01BC\u01C4\u01C7\u01CA\u01CD\u01CF\u01D1\u01D3\u01D5\u01D7\u01D9\u01DB\u01DE\u01E0\u01E2\u01E4\u01E6\u01E8\u01EA\u01EC\u01EE\u01F1\u01F4\u01F6-\u01F8\u01FA\u01FC\u01FE\u0200\u0202\u0204\u0206\u0208\u020A\u020C\u020E\u0210\u0212\u0214\u0216\u0218\u021A\u021C\u021E\u0220\u0222\u0224\u0226\u0228\u022A\u022C\u022E\u0230\u0232\u023A\u023B\u023D\u023E\u0241\u0243-\u0246\u0248\u024A\u024C\u024E\u0370\u0372\u0376\u037F\u0386\u0388-\u038A\u038C\u038E\u038F\u0391-\u03A1\u03A3-\u03AB\u03CF\u03D2-\u03D4\u03D8\u03DA\u03DC\u03DE\u03E0\u03E2\u03E4\u03E6\u03E8\u03EA\u03EC\u03EE\u03F4\u03F7\u03F9\u03FA\u03FD-\u042F\u0460\u0462\u0464\u0466\u0468\u046A\u046C\u046E\u0470\u0472\u0474\u0476\u0478\u047A\u047C\u047E\u0480\u048A\u048C\u048E\u0490\u0492\u0494\u0496\u0498\u049A\u049C\u049E\u04A0\u04A2\u04A4\u04A6\u04A8\u04AA\u04AC\u04AE\u04B0\u04B2\u04B4\u04B6\u04B8\u04BA\u04BC\u04BE\u04C0\u04C1\u04C3\u04C5\u04C7\u04C9\u04CB\u04CD\u04D0\u04D2\u04D4\u04D6\u04D8\u04DA\u04DC\u04DE\u04E0\u04E2\u04E4\u04E6\u04E8\u04EA\u04EC\u04EE\u04F0\u04F2\u04F4\u04F6\u04F8\u04FA\u04FC\u04FE\u0500\u0502\u0504\u0506\u0508\u050A\u050C\u050E\u0510\u0512\u0514\u0516\u0518\u051A\u051C\u051E\u0520\u0522\u0524\u0526\u0528\u052A\u052C\u052E\u0531-\u0556\u10A0-\u10C5\u10C7\u10CD\u13A0-\u13F5\u1E00\u1E02\u1E04\u1E06\u1E08\u1E0A\u1E0C\u1E0E\u1E10\u1E12\u1E14\u1E16\u1E18\u1E1A\u1E1C\u1E1E\u1E20\u1E22\u1E24\u1E26\u1E28\u1E2A\u1E2C\u1E2E\u1E30\u1E32\u1E34\u1E36\u1E38\u1E3A\u1E3C\u1E3E\u1E40\u1E42\u1E44\u1E46\u1E48\u1E4A\u1E4C\u1E4E\u1E50\u1E52\u1E54\u1E56\u1E58\u1E5A\u1E5C\u1E5E\u1E60\u1E62\u1E64\u1E66\u1E68\u1E6A\u1E6C\u1E6E\u1E70\u1E72\u1E74\u1E76\u1E78\u1E7A\u1E7C\u1E7E\u1E80\u1E82\u1E84\u1E86\u1E88\u1E8A\u1E8C\u1E8E\u1E90\u1E92\u1E94\u1E9E\u1EA0\u1EA2\u1EA4\u1EA6\u1EA8\u1EAA\u1EAC\u1EAE\u1EB0\u1EB2\u1EB4\u1EB6\u1EB8\u1EBA\u1EBC\u1EBE\u1EC0\u1EC2\u1EC4\u1EC6\u1EC8\u1ECA\u1ECC\u1ECE\u1ED0\u1ED2\u1ED4\u1ED6\u1ED8\u1EDA\u1EDC\u1EDE\u1EE0\u1EE2\u1EE4\u1EE6\u1EE8\u1EEA\u1EEC\u1EEE\u1EF0\u1EF2\u1EF4\u1EF6\u1EF8\u1EFA\u1EFC\u1EFE\u1F08-\u1F0F\u1F18-\u1F1D\u1F28-\u1F2F\u1F38-\u1F3F\u1F48-\u1F4D\u1F59\u1F5B\u1F5D\u1F5F\u1F68-\u1F6F\u1FB8-\u1FBB\u1FC8-\u1FCB\u1FD8-\u1FDB\u1FE8-\u1FEC\u1FF8-\u1FFB\u2102\u2107\u210B-\u210D\u2110-\u2112\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u2130-\u2133\u213E\u213F\u2145\u2183\u2C00-\u2C2E\u2C60\u2C62-\u2C64\u2C67\u2C69\u2C6B\u2C6D-\u2C70\u2C72\u2C75\u2C7E-\u2C80\u2C82\u2C84\u2C86\u2C88\u2C8A\u2C8C\u2C8E\u2C90\u2C92\u2C94\u2C96\u2C98\u2C9A\u2C9C\u2C9E\u2CA0\u2CA2\u2CA4\u2CA6\u2CA8\u2CAA\u2CAC\u2CAE\u2CB0\u2CB2\u2CB4\u2CB6\u2CB8\u2CBA\u2CBC\u2CBE\u2CC0\u2CC2\u2CC4\u2CC6\u2CC8\u2CCA\u2CCC\u2CCE\u2CD0\u2CD2\u2CD4\u2CD6\u2CD8\u2CDA\u2CDC\u2CDE\u2CE0\u2CE2\u2CEB\u2CED\u2CF2\uA640\uA642\uA644\uA646\uA648\uA64A\uA64C\uA64E\uA650\uA652\uA654\uA656\uA658\uA65A\uA65C\uA65E\uA660\uA662\uA664\uA666\uA668\uA66A\uA66C\uA680\uA682\uA684\uA686\uA688\uA68A\uA68C\uA68E\uA690\uA692\uA694\uA696\uA698\uA69A\uA722\uA724\uA726\uA728\uA72A\uA72C\uA72E\uA732\uA734\uA736\uA738\uA73A\uA73C\uA73E\uA740\uA742\uA744\uA746\uA748\uA74A\uA74C\uA74E\uA750\uA752\uA754\uA756\uA758\uA75A\uA75C\uA75E\uA760\uA762\uA764\uA766\uA768\uA76A\uA76C\uA76E\uA779\uA77B\uA77D\uA77E\uA780\uA782\uA784\uA786\uA78B\uA78D\uA790\uA792\uA796\uA798\uA79A\uA79C\uA79E\uA7A0\uA7A2\uA7A4\uA7A6\uA7A8\uA7AA-\uA7AD\uA7B0-\uA7B4\uA7B6\uFF21-\uFF3A])/g;

    var camelCaseUpperRegexp = /([A-Z\xC0-\xD6\xD8-\xDE\u0100\u0102\u0104\u0106\u0108\u010A\u010C\u010E\u0110\u0112\u0114\u0116\u0118\u011A\u011C\u011E\u0120\u0122\u0124\u0126\u0128\u012A\u012C\u012E\u0130\u0132\u0134\u0136\u0139\u013B\u013D\u013F\u0141\u0143\u0145\u0147\u014A\u014C\u014E\u0150\u0152\u0154\u0156\u0158\u015A\u015C\u015E\u0160\u0162\u0164\u0166\u0168\u016A\u016C\u016E\u0170\u0172\u0174\u0176\u0178\u0179\u017B\u017D\u0181\u0182\u0184\u0186\u0187\u0189-\u018B\u018E-\u0191\u0193\u0194\u0196-\u0198\u019C\u019D\u019F\u01A0\u01A2\u01A4\u01A6\u01A7\u01A9\u01AC\u01AE\u01AF\u01B1-\u01B3\u01B5\u01B7\u01B8\u01BC\u01C4\u01C7\u01CA\u01CD\u01CF\u01D1\u01D3\u01D5\u01D7\u01D9\u01DB\u01DE\u01E0\u01E2\u01E4\u01E6\u01E8\u01EA\u01EC\u01EE\u01F1\u01F4\u01F6-\u01F8\u01FA\u01FC\u01FE\u0200\u0202\u0204\u0206\u0208\u020A\u020C\u020E\u0210\u0212\u0214\u0216\u0218\u021A\u021C\u021E\u0220\u0222\u0224\u0226\u0228\u022A\u022C\u022E\u0230\u0232\u023A\u023B\u023D\u023E\u0241\u0243-\u0246\u0248\u024A\u024C\u024E\u0370\u0372\u0376\u037F\u0386\u0388-\u038A\u038C\u038E\u038F\u0391-\u03A1\u03A3-\u03AB\u03CF\u03D2-\u03D4\u03D8\u03DA\u03DC\u03DE\u03E0\u03E2\u03E4\u03E6\u03E8\u03EA\u03EC\u03EE\u03F4\u03F7\u03F9\u03FA\u03FD-\u042F\u0460\u0462\u0464\u0466\u0468\u046A\u046C\u046E\u0470\u0472\u0474\u0476\u0478\u047A\u047C\u047E\u0480\u048A\u048C\u048E\u0490\u0492\u0494\u0496\u0498\u049A\u049C\u049E\u04A0\u04A2\u04A4\u04A6\u04A8\u04AA\u04AC\u04AE\u04B0\u04B2\u04B4\u04B6\u04B8\u04BA\u04BC\u04BE\u04C0\u04C1\u04C3\u04C5\u04C7\u04C9\u04CB\u04CD\u04D0\u04D2\u04D4\u04D6\u04D8\u04DA\u04DC\u04DE\u04E0\u04E2\u04E4\u04E6\u04E8\u04EA\u04EC\u04EE\u04F0\u04F2\u04F4\u04F6\u04F8\u04FA\u04FC\u04FE\u0500\u0502\u0504\u0506\u0508\u050A\u050C\u050E\u0510\u0512\u0514\u0516\u0518\u051A\u051C\u051E\u0520\u0522\u0524\u0526\u0528\u052A\u052C\u052E\u0531-\u0556\u10A0-\u10C5\u10C7\u10CD\u13A0-\u13F5\u1E00\u1E02\u1E04\u1E06\u1E08\u1E0A\u1E0C\u1E0E\u1E10\u1E12\u1E14\u1E16\u1E18\u1E1A\u1E1C\u1E1E\u1E20\u1E22\u1E24\u1E26\u1E28\u1E2A\u1E2C\u1E2E\u1E30\u1E32\u1E34\u1E36\u1E38\u1E3A\u1E3C\u1E3E\u1E40\u1E42\u1E44\u1E46\u1E48\u1E4A\u1E4C\u1E4E\u1E50\u1E52\u1E54\u1E56\u1E58\u1E5A\u1E5C\u1E5E\u1E60\u1E62\u1E64\u1E66\u1E68\u1E6A\u1E6C\u1E6E\u1E70\u1E72\u1E74\u1E76\u1E78\u1E7A\u1E7C\u1E7E\u1E80\u1E82\u1E84\u1E86\u1E88\u1E8A\u1E8C\u1E8E\u1E90\u1E92\u1E94\u1E9E\u1EA0\u1EA2\u1EA4\u1EA6\u1EA8\u1EAA\u1EAC\u1EAE\u1EB0\u1EB2\u1EB4\u1EB6\u1EB8\u1EBA\u1EBC\u1EBE\u1EC0\u1EC2\u1EC4\u1EC6\u1EC8\u1ECA\u1ECC\u1ECE\u1ED0\u1ED2\u1ED4\u1ED6\u1ED8\u1EDA\u1EDC\u1EDE\u1EE0\u1EE2\u1EE4\u1EE6\u1EE8\u1EEA\u1EEC\u1EEE\u1EF0\u1EF2\u1EF4\u1EF6\u1EF8\u1EFA\u1EFC\u1EFE\u1F08-\u1F0F\u1F18-\u1F1D\u1F28-\u1F2F\u1F38-\u1F3F\u1F48-\u1F4D\u1F59\u1F5B\u1F5D\u1F5F\u1F68-\u1F6F\u1FB8-\u1FBB\u1FC8-\u1FCB\u1FD8-\u1FDB\u1FE8-\u1FEC\u1FF8-\u1FFB\u2102\u2107\u210B-\u210D\u2110-\u2112\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u2130-\u2133\u213E\u213F\u2145\u2183\u2C00-\u2C2E\u2C60\u2C62-\u2C64\u2C67\u2C69\u2C6B\u2C6D-\u2C70\u2C72\u2C75\u2C7E-\u2C80\u2C82\u2C84\u2C86\u2C88\u2C8A\u2C8C\u2C8E\u2C90\u2C92\u2C94\u2C96\u2C98\u2C9A\u2C9C\u2C9E\u2CA0\u2CA2\u2CA4\u2CA6\u2CA8\u2CAA\u2CAC\u2CAE\u2CB0\u2CB2\u2CB4\u2CB6\u2CB8\u2CBA\u2CBC\u2CBE\u2CC0\u2CC2\u2CC4\u2CC6\u2CC8\u2CCA\u2CCC\u2CCE\u2CD0\u2CD2\u2CD4\u2CD6\u2CD8\u2CDA\u2CDC\u2CDE\u2CE0\u2CE2\u2CEB\u2CED\u2CF2\uA640\uA642\uA644\uA646\uA648\uA64A\uA64C\uA64E\uA650\uA652\uA654\uA656\uA658\uA65A\uA65C\uA65E\uA660\uA662\uA664\uA666\uA668\uA66A\uA66C\uA680\uA682\uA684\uA686\uA688\uA68A\uA68C\uA68E\uA690\uA692\uA694\uA696\uA698\uA69A\uA722\uA724\uA726\uA728\uA72A\uA72C\uA72E\uA732\uA734\uA736\uA738\uA73A\uA73C\uA73E\uA740\uA742\uA744\uA746\uA748\uA74A\uA74C\uA74E\uA750\uA752\uA754\uA756\uA758\uA75A\uA75C\uA75E\uA760\uA762\uA764\uA766\uA768\uA76A\uA76C\uA76E\uA779\uA77B\uA77D\uA77E\uA780\uA782\uA784\uA786\uA78B\uA78D\uA790\uA792\uA796\uA798\uA79A\uA79C\uA79E\uA7A0\uA7A2\uA7A4\uA7A6\uA7A8\uA7AA-\uA7AD\uA7B0-\uA7B4\uA7B6\uFF21-\uFF3A])([A-Z\xC0-\xD6\xD8-\xDE\u0100\u0102\u0104\u0106\u0108\u010A\u010C\u010E\u0110\u0112\u0114\u0116\u0118\u011A\u011C\u011E\u0120\u0122\u0124\u0126\u0128\u012A\u012C\u012E\u0130\u0132\u0134\u0136\u0139\u013B\u013D\u013F\u0141\u0143\u0145\u0147\u014A\u014C\u014E\u0150\u0152\u0154\u0156\u0158\u015A\u015C\u015E\u0160\u0162\u0164\u0166\u0168\u016A\u016C\u016E\u0170\u0172\u0174\u0176\u0178\u0179\u017B\u017D\u0181\u0182\u0184\u0186\u0187\u0189-\u018B\u018E-\u0191\u0193\u0194\u0196-\u0198\u019C\u019D\u019F\u01A0\u01A2\u01A4\u01A6\u01A7\u01A9\u01AC\u01AE\u01AF\u01B1-\u01B3\u01B5\u01B7\u01B8\u01BC\u01C4\u01C7\u01CA\u01CD\u01CF\u01D1\u01D3\u01D5\u01D7\u01D9\u01DB\u01DE\u01E0\u01E2\u01E4\u01E6\u01E8\u01EA\u01EC\u01EE\u01F1\u01F4\u01F6-\u01F8\u01FA\u01FC\u01FE\u0200\u0202\u0204\u0206\u0208\u020A\u020C\u020E\u0210\u0212\u0214\u0216\u0218\u021A\u021C\u021E\u0220\u0222\u0224\u0226\u0228\u022A\u022C\u022E\u0230\u0232\u023A\u023B\u023D\u023E\u0241\u0243-\u0246\u0248\u024A\u024C\u024E\u0370\u0372\u0376\u037F\u0386\u0388-\u038A\u038C\u038E\u038F\u0391-\u03A1\u03A3-\u03AB\u03CF\u03D2-\u03D4\u03D8\u03DA\u03DC\u03DE\u03E0\u03E2\u03E4\u03E6\u03E8\u03EA\u03EC\u03EE\u03F4\u03F7\u03F9\u03FA\u03FD-\u042F\u0460\u0462\u0464\u0466\u0468\u046A\u046C\u046E\u0470\u0472\u0474\u0476\u0478\u047A\u047C\u047E\u0480\u048A\u048C\u048E\u0490\u0492\u0494\u0496\u0498\u049A\u049C\u049E\u04A0\u04A2\u04A4\u04A6\u04A8\u04AA\u04AC\u04AE\u04B0\u04B2\u04B4\u04B6\u04B8\u04BA\u04BC\u04BE\u04C0\u04C1\u04C3\u04C5\u04C7\u04C9\u04CB\u04CD\u04D0\u04D2\u04D4\u04D6\u04D8\u04DA\u04DC\u04DE\u04E0\u04E2\u04E4\u04E6\u04E8\u04EA\u04EC\u04EE\u04F0\u04F2\u04F4\u04F6\u04F8\u04FA\u04FC\u04FE\u0500\u0502\u0504\u0506\u0508\u050A\u050C\u050E\u0510\u0512\u0514\u0516\u0518\u051A\u051C\u051E\u0520\u0522\u0524\u0526\u0528\u052A\u052C\u052E\u0531-\u0556\u10A0-\u10C5\u10C7\u10CD\u13A0-\u13F5\u1E00\u1E02\u1E04\u1E06\u1E08\u1E0A\u1E0C\u1E0E\u1E10\u1E12\u1E14\u1E16\u1E18\u1E1A\u1E1C\u1E1E\u1E20\u1E22\u1E24\u1E26\u1E28\u1E2A\u1E2C\u1E2E\u1E30\u1E32\u1E34\u1E36\u1E38\u1E3A\u1E3C\u1E3E\u1E40\u1E42\u1E44\u1E46\u1E48\u1E4A\u1E4C\u1E4E\u1E50\u1E52\u1E54\u1E56\u1E58\u1E5A\u1E5C\u1E5E\u1E60\u1E62\u1E64\u1E66\u1E68\u1E6A\u1E6C\u1E6E\u1E70\u1E72\u1E74\u1E76\u1E78\u1E7A\u1E7C\u1E7E\u1E80\u1E82\u1E84\u1E86\u1E88\u1E8A\u1E8C\u1E8E\u1E90\u1E92\u1E94\u1E9E\u1EA0\u1EA2\u1EA4\u1EA6\u1EA8\u1EAA\u1EAC\u1EAE\u1EB0\u1EB2\u1EB4\u1EB6\u1EB8\u1EBA\u1EBC\u1EBE\u1EC0\u1EC2\u1EC4\u1EC6\u1EC8\u1ECA\u1ECC\u1ECE\u1ED0\u1ED2\u1ED4\u1ED6\u1ED8\u1EDA\u1EDC\u1EDE\u1EE0\u1EE2\u1EE4\u1EE6\u1EE8\u1EEA\u1EEC\u1EEE\u1EF0\u1EF2\u1EF4\u1EF6\u1EF8\u1EFA\u1EFC\u1EFE\u1F08-\u1F0F\u1F18-\u1F1D\u1F28-\u1F2F\u1F38-\u1F3F\u1F48-\u1F4D\u1F59\u1F5B\u1F5D\u1F5F\u1F68-\u1F6F\u1FB8-\u1FBB\u1FC8-\u1FCB\u1FD8-\u1FDB\u1FE8-\u1FEC\u1FF8-\u1FFB\u2102\u2107\u210B-\u210D\u2110-\u2112\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u2130-\u2133\u213E\u213F\u2145\u2183\u2C00-\u2C2E\u2C60\u2C62-\u2C64\u2C67\u2C69\u2C6B\u2C6D-\u2C70\u2C72\u2C75\u2C7E-\u2C80\u2C82\u2C84\u2C86\u2C88\u2C8A\u2C8C\u2C8E\u2C90\u2C92\u2C94\u2C96\u2C98\u2C9A\u2C9C\u2C9E\u2CA0\u2CA2\u2CA4\u2CA6\u2CA8\u2CAA\u2CAC\u2CAE\u2CB0\u2CB2\u2CB4\u2CB6\u2CB8\u2CBA\u2CBC\u2CBE\u2CC0\u2CC2\u2CC4\u2CC6\u2CC8\u2CCA\u2CCC\u2CCE\u2CD0\u2CD2\u2CD4\u2CD6\u2CD8\u2CDA\u2CDC\u2CDE\u2CE0\u2CE2\u2CEB\u2CED\u2CF2\uA640\uA642\uA644\uA646\uA648\uA64A\uA64C\uA64E\uA650\uA652\uA654\uA656\uA658\uA65A\uA65C\uA65E\uA660\uA662\uA664\uA666\uA668\uA66A\uA66C\uA680\uA682\uA684\uA686\uA688\uA68A\uA68C\uA68E\uA690\uA692\uA694\uA696\uA698\uA69A\uA722\uA724\uA726\uA728\uA72A\uA72C\uA72E\uA732\uA734\uA736\uA738\uA73A\uA73C\uA73E\uA740\uA742\uA744\uA746\uA748\uA74A\uA74C\uA74E\uA750\uA752\uA754\uA756\uA758\uA75A\uA75C\uA75E\uA760\uA762\uA764\uA766\uA768\uA76A\uA76C\uA76E\uA779\uA77B\uA77D\uA77E\uA780\uA782\uA784\uA786\uA78B\uA78D\uA790\uA792\uA796\uA798\uA79A\uA79C\uA79E\uA7A0\uA7A2\uA7A4\uA7A6\uA7A8\uA7AA-\uA7AD\uA7B0-\uA7B4\uA7B6\uFF21-\uFF3A][a-z\xB5\xDF-\xF6\xF8-\xFF\u0101\u0103\u0105\u0107\u0109\u010B\u010D\u010F\u0111\u0113\u0115\u0117\u0119\u011B\u011D\u011F\u0121\u0123\u0125\u0127\u0129\u012B\u012D\u012F\u0131\u0133\u0135\u0137\u0138\u013A\u013C\u013E\u0140\u0142\u0144\u0146\u0148\u0149\u014B\u014D\u014F\u0151\u0153\u0155\u0157\u0159\u015B\u015D\u015F\u0161\u0163\u0165\u0167\u0169\u016B\u016D\u016F\u0171\u0173\u0175\u0177\u017A\u017C\u017E-\u0180\u0183\u0185\u0188\u018C\u018D\u0192\u0195\u0199-\u019B\u019E\u01A1\u01A3\u01A5\u01A8\u01AA\u01AB\u01AD\u01B0\u01B4\u01B6\u01B9\u01BA\u01BD-\u01BF\u01C6\u01C9\u01CC\u01CE\u01D0\u01D2\u01D4\u01D6\u01D8\u01DA\u01DC\u01DD\u01DF\u01E1\u01E3\u01E5\u01E7\u01E9\u01EB\u01ED\u01EF\u01F0\u01F3\u01F5\u01F9\u01FB\u01FD\u01FF\u0201\u0203\u0205\u0207\u0209\u020B\u020D\u020F\u0211\u0213\u0215\u0217\u0219\u021B\u021D\u021F\u0221\u0223\u0225\u0227\u0229\u022B\u022D\u022F\u0231\u0233-\u0239\u023C\u023F\u0240\u0242\u0247\u0249\u024B\u024D\u024F-\u0293\u0295-\u02AF\u0371\u0373\u0377\u037B-\u037D\u0390\u03AC-\u03CE\u03D0\u03D1\u03D5-\u03D7\u03D9\u03DB\u03DD\u03DF\u03E1\u03E3\u03E5\u03E7\u03E9\u03EB\u03ED\u03EF-\u03F3\u03F5\u03F8\u03FB\u03FC\u0430-\u045F\u0461\u0463\u0465\u0467\u0469\u046B\u046D\u046F\u0471\u0473\u0475\u0477\u0479\u047B\u047D\u047F\u0481\u048B\u048D\u048F\u0491\u0493\u0495\u0497\u0499\u049B\u049D\u049F\u04A1\u04A3\u04A5\u04A7\u04A9\u04AB\u04AD\u04AF\u04B1\u04B3\u04B5\u04B7\u04B9\u04BB\u04BD\u04BF\u04C2\u04C4\u04C6\u04C8\u04CA\u04CC\u04CE\u04CF\u04D1\u04D3\u04D5\u04D7\u04D9\u04DB\u04DD\u04DF\u04E1\u04E3\u04E5\u04E7\u04E9\u04EB\u04ED\u04EF\u04F1\u04F3\u04F5\u04F7\u04F9\u04FB\u04FD\u04FF\u0501\u0503\u0505\u0507\u0509\u050B\u050D\u050F\u0511\u0513\u0515\u0517\u0519\u051B\u051D\u051F\u0521\u0523\u0525\u0527\u0529\u052B\u052D\u052F\u0561-\u0587\u13F8-\u13FD\u1D00-\u1D2B\u1D6B-\u1D77\u1D79-\u1D9A\u1E01\u1E03\u1E05\u1E07\u1E09\u1E0B\u1E0D\u1E0F\u1E11\u1E13\u1E15\u1E17\u1E19\u1E1B\u1E1D\u1E1F\u1E21\u1E23\u1E25\u1E27\u1E29\u1E2B\u1E2D\u1E2F\u1E31\u1E33\u1E35\u1E37\u1E39\u1E3B\u1E3D\u1E3F\u1E41\u1E43\u1E45\u1E47\u1E49\u1E4B\u1E4D\u1E4F\u1E51\u1E53\u1E55\u1E57\u1E59\u1E5B\u1E5D\u1E5F\u1E61\u1E63\u1E65\u1E67\u1E69\u1E6B\u1E6D\u1E6F\u1E71\u1E73\u1E75\u1E77\u1E79\u1E7B\u1E7D\u1E7F\u1E81\u1E83\u1E85\u1E87\u1E89\u1E8B\u1E8D\u1E8F\u1E91\u1E93\u1E95-\u1E9D\u1E9F\u1EA1\u1EA3\u1EA5\u1EA7\u1EA9\u1EAB\u1EAD\u1EAF\u1EB1\u1EB3\u1EB5\u1EB7\u1EB9\u1EBB\u1EBD\u1EBF\u1EC1\u1EC3\u1EC5\u1EC7\u1EC9\u1ECB\u1ECD\u1ECF\u1ED1\u1ED3\u1ED5\u1ED7\u1ED9\u1EDB\u1EDD\u1EDF\u1EE1\u1EE3\u1EE5\u1EE7\u1EE9\u1EEB\u1EED\u1EEF\u1EF1\u1EF3\u1EF5\u1EF7\u1EF9\u1EFB\u1EFD\u1EFF-\u1F07\u1F10-\u1F15\u1F20-\u1F27\u1F30-\u1F37\u1F40-\u1F45\u1F50-\u1F57\u1F60-\u1F67\u1F70-\u1F7D\u1F80-\u1F87\u1F90-\u1F97\u1FA0-\u1FA7\u1FB0-\u1FB4\u1FB6\u1FB7\u1FBE\u1FC2-\u1FC4\u1FC6\u1FC7\u1FD0-\u1FD3\u1FD6\u1FD7\u1FE0-\u1FE7\u1FF2-\u1FF4\u1FF6\u1FF7\u210A\u210E\u210F\u2113\u212F\u2134\u2139\u213C\u213D\u2146-\u2149\u214E\u2184\u2C30-\u2C5E\u2C61\u2C65\u2C66\u2C68\u2C6A\u2C6C\u2C71\u2C73\u2C74\u2C76-\u2C7B\u2C81\u2C83\u2C85\u2C87\u2C89\u2C8B\u2C8D\u2C8F\u2C91\u2C93\u2C95\u2C97\u2C99\u2C9B\u2C9D\u2C9F\u2CA1\u2CA3\u2CA5\u2CA7\u2CA9\u2CAB\u2CAD\u2CAF\u2CB1\u2CB3\u2CB5\u2CB7\u2CB9\u2CBB\u2CBD\u2CBF\u2CC1\u2CC3\u2CC5\u2CC7\u2CC9\u2CCB\u2CCD\u2CCF\u2CD1\u2CD3\u2CD5\u2CD7\u2CD9\u2CDB\u2CDD\u2CDF\u2CE1\u2CE3\u2CE4\u2CEC\u2CEE\u2CF3\u2D00-\u2D25\u2D27\u2D2D\uA641\uA643\uA645\uA647\uA649\uA64B\uA64D\uA64F\uA651\uA653\uA655\uA657\uA659\uA65B\uA65D\uA65F\uA661\uA663\uA665\uA667\uA669\uA66B\uA66D\uA681\uA683\uA685\uA687\uA689\uA68B\uA68D\uA68F\uA691\uA693\uA695\uA697\uA699\uA69B\uA723\uA725\uA727\uA729\uA72B\uA72D\uA72F-\uA731\uA733\uA735\uA737\uA739\uA73B\uA73D\uA73F\uA741\uA743\uA745\uA747\uA749\uA74B\uA74D\uA74F\uA751\uA753\uA755\uA757\uA759\uA75B\uA75D\uA75F\uA761\uA763\uA765\uA767\uA769\uA76B\uA76D\uA76F\uA771-\uA778\uA77A\uA77C\uA77F\uA781\uA783\uA785\uA787\uA78C\uA78E\uA791\uA793-\uA795\uA797\uA799\uA79B\uA79D\uA79F\uA7A1\uA7A3\uA7A5\uA7A7\uA7A9\uA7B5\uA7B7\uA7FA\uAB30-\uAB5A\uAB60-\uAB65\uAB70-\uABBF\uFB00-\uFB06\uFB13-\uFB17\uFF41-\uFF5A])/g;

    /**
     * Sentence case a string.
     *
     * @param  {string} str
     * @param  {string} locale
     * @param  {string} replacement
     * @return {string}
     */
    var noCase = function (str, locale, replacement) {
      if (str == null) {
        return ''
      }

      replacement = typeof replacement !== 'string' ? ' ' : replacement;

      function replace (match, index, value) {
        if (index === 0 || index === (value.length - match.length)) {
          return ''
        }

        return replacement
      }

      str = String(str)
        // Support camel case ("camelCase" -> "camel Case").
        .replace(camelCaseRegexp, '$1 $2')
        // Support odd camel case ("CAMELCase" -> "CAMEL Case").
        .replace(camelCaseUpperRegexp, '$1 $2')
        // Remove all non-word characters and replace with a single space.
        .replace(nonWordRegexp, replace);

      // Lower case the entire string.
      return lowerCase(str, locale)
    };

    /**
     * Dot case a string.
     *
     * @param  {string} value
     * @param  {string} [locale]
     * @return {string}
     */
    var dotCase = function (value, locale) {
      return noCase(value, locale, '.')
    };

    /**
     * Special language-specific overrides.
     *
     * Source: ftp://ftp.unicode.org/Public/UCD/latest/ucd/SpecialCasing.txt
     *
     * @type {Object}
     */
    var LANGUAGES$1 = {
      tr: {
        regexp: /[\u0069]/g,
        map: {
          '\u0069': '\u0130'
        }
      },
      az: {
        regexp: /[\u0069]/g,
        map: {
          '\u0069': '\u0130'
        }
      },
      lt: {
        regexp: /[\u0069\u006A\u012F]\u0307|\u0069\u0307[\u0300\u0301\u0303]/g,
        map: {
          '\u0069\u0307': '\u0049',
          '\u006A\u0307': '\u004A',
          '\u012F\u0307': '\u012E',
          '\u0069\u0307\u0300': '\u00CC',
          '\u0069\u0307\u0301': '\u00CD',
          '\u0069\u0307\u0303': '\u0128'
        }
      }
    };

    /**
     * Upper case a string.
     *
     * @param  {String} str
     * @return {String}
     */
    var upperCase = function (str, locale) {
      var lang = LANGUAGES$1[locale];

      str = str == null ? '' : String(str);

      if (lang) {
        str = str.replace(lang.regexp, function (m) { return lang.map[m] });
      }

      return str.toUpperCase()
    };

    /**
     * Swap the case of a string. Manually iterate over every character and check
     * instead of replacing certain characters for better unicode support.
     *
     * @param  {String} str
     * @param  {String} [locale]
     * @return {String}
     */
    var swapCase = function (str, locale) {
      if (str == null) {
        return ''
      }

      var result = '';

      for (var i = 0; i < str.length; i++) {
        var c = str[i];
        var u = upperCase(c, locale);

        result += u === c ? lowerCase(c, locale) : u;
      }

      return result
    };

    /**
     * Path case a string.
     *
     * @param  {string} value
     * @param  {string} [locale]
     * @return {string}
     */
    var pathCase = function (value, locale) {
      return noCase(value, locale, '/')
    };

    /**
     * Camel case a string.
     *
     * @param  {string} value
     * @param  {string} [locale]
     * @return {string}
     */
    var camelCase = function (value, locale, mergeNumbers) {
      var result = noCase(value, locale);

      // Replace periods between numeric entities with an underscore.
      if (!mergeNumbers) {
        result = result.replace(/ (?=\d)/g, '_');
      }

      // Replace spaces between words with an upper cased character.
      return result.replace(/ (.)/g, function (m, $1) {
        return upperCase($1, locale)
      })
    };

    /**
     * Snake case a string.
     *
     * @param  {string} value
     * @param  {string} [locale]
     * @return {string}
     */
    var snakeCase = function (value, locale) {
      return noCase(value, locale, '_')
    };

    /**
     * Title case a string.
     *
     * @param  {string} value
     * @param  {string} [locale]
     * @return {string}
     */
    var titleCase = function (value, locale) {
      return noCase(value, locale).replace(/^.| ./g, function (m) {
        return upperCase(m, locale)
      })
    };

    /**
     * Param case a string.
     *
     * @param  {string} value
     * @param  {string} [locale]
     * @return {string}
     */
    var paramCase = function (value, locale) {
      return noCase(value, locale, '-')
    };

    /**
     * Header case a string.
     *
     * @param  {string} value
     * @param  {string} [locale]
     * @return {string}
     */
    var headerCase = function (value, locale) {
      return noCase(value, locale, '-').replace(/^.|-./g, function (m) {
        return upperCase(m, locale)
      })
    };

    /**
     * Upper case the first character of a string.
     *
     * @param  {String} str
     * @return {String}
     */
    var upperCaseFirst = function (str, locale) {
      if (str == null) {
        return ''
      }

      str = String(str);

      return upperCase(str.charAt(0), locale) + str.substr(1)
    };

    /**
     * Pascal case a string.
     *
     * @param  {string}  value
     * @param  {string}  [locale]
     * @param  {boolean} [mergeNumbers]
     * @return {string}
     */
    var pascalCase = function (value, locale, mergeNumbers) {
      return upperCaseFirst(camelCase(value, locale, mergeNumbers), locale)
    };

    /**
     * Constant case a string.
     *
     * @param  {string} value
     * @param  {string} [locale]
     * @return {string}
     */
    var constantCase = function (value, locale) {
      return upperCase(snakeCase(value, locale), locale)
    };

    /**
     * Sentence case a string.
     *
     * @param  {string} value
     * @param  {string} [locale]
     * @return {string}
     */
    var sentenceCase = function (value, locale) {
      return upperCaseFirst(noCase(value, locale), locale)
    };

    /**
     * Check if a string is upper case.
     *
     * @param  {String}  string
     * @param  {String}  [locale]
     * @return {Boolean}
     */
    var isUpperCase = function (string, locale) {
      return upperCase(string, locale) === string
    };

    /**
     * Check if a string is lower case.
     *
     * @param  {String}  string
     * @param  {String}  [locale]
     * @return {Boolean}
     */
    var isLowerCase = function (string, locale) {
      return lowerCase(string, locale) === string
    };

    /**
     * Lower case the first character of a string.
     *
     * @param  {String} str
     * @return {String}
     */
    var lowerCaseFirst = function (str, locale) {
      if (str == null) {
        return ''
      }

      str = String(str);

      return lowerCase(str.charAt(0), locale) + str.substr(1)
    };

    var changeCase = createCommonjsModule(function (module, exports) {
    exports.no = exports.noCase = noCase;
    exports.dot = exports.dotCase = dotCase;
    exports.swap = exports.swapCase = swapCase;
    exports.path = exports.pathCase = pathCase;
    exports.upper = exports.upperCase = upperCase;
    exports.lower = exports.lowerCase = lowerCase;
    exports.camel = exports.camelCase = camelCase;
    exports.snake = exports.snakeCase = snakeCase;
    exports.title = exports.titleCase = titleCase;
    exports.param = exports.paramCase = paramCase;
    exports.kebab = exports.kebabCase = exports.paramCase;
    exports.hyphen = exports.hyphenCase = exports.paramCase;
    exports.header = exports.headerCase = headerCase;
    exports.pascal = exports.pascalCase = pascalCase;
    exports.constant = exports.constantCase = constantCase;
    exports.sentence = exports.sentenceCase = sentenceCase;
    exports.isUpper = exports.isUpperCase = isUpperCase;
    exports.isLower = exports.isLowerCase = isLowerCase;
    exports.ucFirst = exports.upperCaseFirst = upperCaseFirst;
    exports.lcFirst = exports.lowerCaseFirst = lowerCaseFirst;
    });
    var changeCase_1 = changeCase.no;
    var changeCase_2 = changeCase.noCase;
    var changeCase_3 = changeCase.dot;
    var changeCase_4 = changeCase.dotCase;
    var changeCase_5 = changeCase.swap;
    var changeCase_6 = changeCase.swapCase;
    var changeCase_7 = changeCase.path;
    var changeCase_8 = changeCase.pathCase;
    var changeCase_9 = changeCase.upper;
    var changeCase_10 = changeCase.upperCase;
    var changeCase_11 = changeCase.lower;
    var changeCase_12 = changeCase.lowerCase;
    var changeCase_13 = changeCase.camel;
    var changeCase_14 = changeCase.camelCase;
    var changeCase_15 = changeCase.snake;
    var changeCase_16 = changeCase.snakeCase;
    var changeCase_17 = changeCase.title;
    var changeCase_18 = changeCase.titleCase;
    var changeCase_19 = changeCase.param;
    var changeCase_20 = changeCase.paramCase;
    var changeCase_21 = changeCase.kebab;
    var changeCase_22 = changeCase.kebabCase;
    var changeCase_23 = changeCase.hyphen;
    var changeCase_24 = changeCase.hyphenCase;
    var changeCase_25 = changeCase.header;
    var changeCase_26 = changeCase.headerCase;
    var changeCase_27 = changeCase.pascal;
    var changeCase_28 = changeCase.pascalCase;
    var changeCase_29 = changeCase.constant;
    var changeCase_30 = changeCase.constantCase;
    var changeCase_31 = changeCase.sentence;
    var changeCase_32 = changeCase.sentenceCase;
    var changeCase_33 = changeCase.isUpper;
    var changeCase_34 = changeCase.isUpperCase;
    var changeCase_35 = changeCase.isLower;
    var changeCase_36 = changeCase.isLowerCase;
    var changeCase_37 = changeCase.ucFirst;
    var changeCase_38 = changeCase.upperCaseFirst;
    var changeCase_39 = changeCase.lcFirst;
    var changeCase_40 = changeCase.lowerCaseFirst;

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
            return new Promise(function (resolve, reject) {
                var deleteFolderRecursive = function (path) {
                    if (fs.existsSync(path)) {
                        fs.readdirSync(path).forEach(function (file, index) {
                            var curPath = path + "/" + file;
                            if (fs.lstatSync(curPath).isDirectory()) { // recurse
                                deleteFolderRecursive(curPath);
                            }
                            else { // delete file
                                fs.unlinkSync(curPath);
                            }
                        });
                        fs.rmdirSync(path);
                    }
                };
                try {
                    deleteFolderRecursive(path.resolve(_this.out));
                    resolve();
                }
                catch (e) {
                    reject(e);
                }
            });
        };
        TemplatePrinter.prototype.createFolders = function () {
            var _this = this;
            return new Promise(function (resolve, reject) {
                _this.cleanFolder().then(function () {
                    fs.mkdirSync(path.resolve(_this.out));
                    fs.mkdirSync(path.resolve(_this.out + '/models'));
                    fs.mkdirSync(path.resolve(_this.out + '/models/enums'));
                    fs.mkdirSync(path.resolve(_this.out + '/services'));
                    resolve();
                }).catch(function () { reject(); });
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
                fs.writeFileSync(path.resolve(this.out + '/models/enums/' + changeCase_22(value.name) + '.enum.ts'), compiled);
            }
            catch (e) {
                this._logger.err('[ ERROR ] file: ' + this.out + '/models/enums/' + value.name + '.enum.ts');
            }
        };
        TemplatePrinter.prototype.printModel = function (model) {
            var _this = this;
            var compiled = this.modelCompiler.compile(model);
            /// this._logger.ok(path.resolve(this.out + '/models/' + model.name + '.model.ts'));
            fs.writeFile(path.resolve(this.out + '/models/' + changeCase_22(model.name) + '.model.ts'), compiled, function (err) {
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
                fs.writeFile(path.resolve(this.out + '/services/' + changeCase_22(name) + '.service.ts'), compiled, function (err) {
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
            fs.writeFile(path.resolve(this.out + '/api.module.ts'), compiled, function (err) {
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
                fs.writeFileSync(path.resolve(this.out + '/index.ts'), imports);
            }
            catch (e) {
                this._logger.err('[ ERROR ] file: ' + this.out + '/index.ts');
            }
        };
        TemplatePrinter.prototype.printServiceIndex = function () {
            var imports = [];
            for (var _i = 0, _a = this._printedServices; _i < _a.length; _i++) {
                var item = _a[_i];
                imports.push("export { " + item + "APIService, I" + item + "APIService } from './" + item + ".service';");
            }
            imports.push('');
            try {
                fs.writeFileSync(path.resolve(this.out + '/services/index.ts'), imports.join('\r\n'));
            }
            catch (e) {
                this._logger.err('[ ERROR ] file: ' + this.out + '/services/index.ts');
            }
        };
        TemplatePrinter.prototype.printModelIndex = function (models) {
            var imports = [];
            for (var _i = 0, models_2 = models; _i < models_2.length; _i++) {
                var item = models_2[_i];
                imports.push("export { " + item.name + ", I" + item.name + " } from './" + item.name + ".model';");
            }
            imports.push("export * from './enums';");
            imports.push('');
            try {
                fs.writeFileSync(path.resolve(this.out + '/models/index.ts'), imports.join('\r\n'));
            }
            catch (e) {
                this._logger.err('[ ERROR ] file: ' + this.out + '/models/index.ts');
            }
        };
        TemplatePrinter.prototype.printEnumIndex = function (enums) {
            var imports = [];
            for (var _i = 0, enums_2 = enums; _i < enums_2.length; _i++) {
                var item = enums_2[_i];
                imports.push("export {" + item.name + "} from './" + item.name + ".enum';");
            }
            imports.push('');
            try {
                fs.writeFileSync(path.resolve(this.out + '/models/enums/index.ts'), imports.join('\r\n'));
            }
            catch (e) {
                this._logger.err('[ ERROR ] file: ' + this.out + '/models/enums/index.ts');
            }
        };
        return TemplatePrinter;
    }());

    request.defaults({
        strictSSL: false,
    });
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
                        extend = JSON.parse(fs.readFileSync("./sw2ngx-extend.json", "utf-8"));
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
                    request.get(conf, function (err, resp, body) {
                        console.log(err);
                        if (err) {
                            _this._logger.err(err);
                            reject(err);
                        }
                        else {
                            resolve(JSON.parse(body));
                        }
                    });
                }
                else {
                    _this.swagger = JSON.parse(fs.readFileSync(conf, "utf-8"));
                    resolve(_this.swagger);
                }
            });
            return promise;
        };
        return Generator;
    }());

    var app = new Generator();

    return Generator;

}));
//# sourceMappingURL=sw2ngx.umd.js.map
