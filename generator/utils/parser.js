const logger = require('./logger');

module.exports = (function () {
    const _self = this;
    /* */
    _self.models = [];
    _self.services = [];
    _self.enums = [];
    /* private parsing */
    _self.resolveServiceImports = function (servicesList) {
        for (let serv in servicesList) {
            if (servicesList.hasOwnProperty(serv)) {
                let imports = [];
                for (let method of servicesList[serv].methods) {
                    if (method.resp.imports !== null) {
                        imports.push(method.resp.imports);
                    }

                    for (let param of method.params.uri) {
                        if (param.type[1]) {
                            imports.push(param.type[1]);
                        }
                    }

                    for (let param of method.params.query) {
                        if (param.type[1]) {
                            imports.push(param.type[1]);
                        }
                    }

                    for (let param of method.params.payload) {
                        if (param.type[1]) {
                            imports.push(param.type[1]);
                        }
                    }

                }
                servicesList[serv].imports = _self.resolveImports(imports);
            }
        }
        return servicesList;
    }



    _self.parseMethod = function (uri, type, method) {
        return {
            uri: uri.replace(/\{/ig, '${'),
            type: type,
            tag: _self.parseTags(method.tags),
            name: method.operationId,
            description: method.summary,
            params: _self.parseParams(method.parameters),
            resp: _self.parseResponse(method.responses)
        }
    }

    _self.parseTags = function (tags) {
        let result = '';
        if (tags.length >= 1) {
            return tags[0];
        } else {
            return '__common'
        }
    }


    _self.parseModelProp = function (name, prop) {
        const resolvedType = _self.resolveType(prop, name);
        return {
            name: name,
            type: resolvedType[0],
            imports: resolvedType[1],
            description: prop.description !== '' ? prop.description : ''
        }
    }

    _self.parseParams = function (params) {
        const parsed = {
            all: [],
            uri: [],
            query: [],
            payload: [],
            form: []
        };
        for (const param in params) {
            if (params.hasOwnProperty(param)) {
                let type = [];
                if (params[param].schema) {
                    type = _self.resolveType(params[param].schema, params[param].name);
                } else {
                    type = _self.resolveType(params[param], params[param].name);
                }
                let res = {
                    name: params[param].name.replace(/\.|\-/ig, ''),
                    query_name: params[param].name,
                    description: params[param].description,
                    required: params[param].required,
                    type: type
                }
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
    }

    _self.parseResponse = function (responses) {
        if (responses['200']) {
            if (responses['200']['schema']) {
                const resolvedType = _self.resolveType(responses['200']['schema'], 'response');
                if (resolvedType[0] === null) {
                    return {
                        type: 'any',
                        imports: null
                    };
                } else {
                    if (resolvedType[1] !== null) {
                        return {
                            type: resolvedType[0],
                            imports: resolvedType[1]
                        };
                    } else {
                        return {
                            type: resolvedType[0],
                            imports: null
                        };
                    }
                }
            } else {
                return {
                    type: 'any',
                    imports: null
                };
            }
        } else {
            return {
                type: 'any',
                imports: null
            };
        }
    }
    

    _self.parseServices = function (paths, baseURI) {
        let result = {
            __common: {
                uri: baseURI,
                imports: [],
                methods: []
            }
        };
        for (let path in paths) {
            if (paths.hasOwnProperty(path)) {
                for (let method in paths[path]) {
                    if (paths[path].hasOwnProperty(method)) {
                        let parsedMethod = _self.parseMethod(path, method, paths[path][method]);
                        if (result.hasOwnProperty(parsedMethod.tag)) {
                            result[parsedMethod.tag].methods.push(parsedMethod);
                        } else {
                            result[parsedMethod.tag] = {
                                uri: baseURI,
                                imports: [],
                                methods: [parsedMethod]
                            }
                        }
                    }
                }
            }
        }
        result = _self.resolveServiceImports(result);
        _self.services = result;
    }
    _self.parseModels = function (models) {
        for (const key in models) {
            const model = {
                description: '',
                imports: [],
                props: []
            }
            if (models.hasOwnProperty(key)) {
                const imports = [];
                model.name = key;
                model.description = models[key].description;
                for (const prop in models[key].properties) {
                    if (models[key].properties.hasOwnProperty(prop)) {
                        const temp = _self.parseModelProp(prop, models[key].properties[prop]);
                        imports.push(temp.imports);
                        model.props.push(temp);
                    }
                }
                model.imports = _self.resolveImports(imports);
            }
            _self.models.push(model);
        }
    }
    _self.resolveImports = function (imports) {
        const result = [];
        for (const imp of imports) {
            if (result.indexOf(imp) === -1) {
                if (imp !== null) {
                    result.push(imp);
                }
            }
        }
        return result;
    }
    _self.extractEnums = function (str, propEnum) {
        const result = [];
        var indexOf = str.search(/\(\d/ig);
        if (indexOf !== -1) {
            let temp = str.substr(indexOf + 1).replace(')', '');
            temp = temp.split(',');
            for (let tmp of temp) {;
                let key = tmp.split('=');
                result.push({
                    key: key[1],
                    val: key[0]
                });
            }
        } else {
            for (var key in propEnum) {
                if (propEnum.hasOwnProperty(key)) {
                    result.push({
                        key: 'enum' + key,
                        val: propEnum[key]
                    })
                }
            }
        }
        return result;
    }
    _self.resolveType = function (prop, name) {
        let curname = name.replace(/\.|\-/ig, '_');
        if (prop === undefined) {
            return ['any', null];
        }
        if ((!prop.enum) && (!prop.format)) {
            if (prop.$ref !== undefined) {
                const temp = prop.$ref.split('/');
                return [temp[temp.length - 1], temp[temp.length - 1]];
            }
            if (prop.type === 'number') {
                return ['number', null];
            }
            if (prop.type === 'string') {
                return ['string', null];
            }
            if (prop.type === 'boolean') {
                return ['boolean', null];
            }
            if (prop.type === 'array') {
                temp = _self.resolveType(prop.items, curname);
                return [temp[0] + "[]", temp[1] ? temp[1] : null];
            }
            if (prop.type === 'object') {
                return ['any', null];
            }
        } else {
            if (prop.enum !== undefined) {
                console.log(prop);
                const temp = _self.extractEnums(prop.description ? prop.description:'', prop.enum);
                let dublicate = '';
                let equals = false;
                for (let item of enums) {
                    if (item.name.toLowerCase() === curname.toLowerCase()) {
                        dublicate = item;

                        if (item.props.length === temp.length) {

                            equals = true;
                            for (var i = 0; i < item.props.length; i++) {

                                if ((item.props[i].key !== temp[i].key) || (item.props[i].val !== temp[i].val)) {
                                    equals = false;
                                    break;
                                }
                            }
                        }
                        break;
                    }
                }
                if ((dublicate !== '') && equals) {
                    return [dublicate.name, dublicate.name];
                }
                if ((dublicate !== '') && (!equals)) {
                    _self.enums.push({
                        name: curname + '_other',
                        props: temp
                    });
                    return [curname + '_other', curname + '_other'];
                }
                _self.enums.push({
                    name: curname,
                    props: temp
                });
                return [curname, curname];
            }
            if (prop.format) {
                switch (prop.format) {
                    case 'date-time':
                        return ['Date', null];
                        break;
                    case 'date':
                        return ['Date', null];
                        break;
                    case 'int32':
                        return ['number', null];
                        break;
                    case 'integer':
                        return ['number', null];
                        break;
                    case 'float':
                        return ['number', null];
                        break;
                    case 'double':
                        return ['number', null];
                        break;
                    case 'int64':
                        return ['number', null];
                        break;
                    case 'password':
                        return ['string', null];
                        break;
                    default:
                        return ['any', null];
                        break;
                }
            }

        }
        return ['any', null];
    }

    _self.getModels = function () {
        const idx = [];
        const data = [];
        for(let model of _self.models){
            idx.push(model.name);
            data.push({
                name: model.name,
                model: model
            });
        }
        return {
            name:'',
            data: data,
            index: idx
        }
    }
    _self.getEnums = function () {
        const idx = [];
        const data = [];
        for (let elem of _self.enums) {
            idx.push(elem.name);
            data.push({
                name: elem.name,
                model: elem
            })
        }
        return {
            name: '',
            data: data,
            index: idx
        }
    }
    _self.getModule = function () {
        let temp = _self.getServices();
        return {
            data: [
                {
                    name:'',
                    model: temp.index
                }
            ],
            index: null
        }
    }
    _self.getServices = function () {
        const idx = [];
        const data = [];
        logger.fg('red').writeln('services').reset();
        for (const srv in _self.services) {
            if (_self.services.hasOwnProperty(srv)) {
                if (_self.services[srv].methods.length > 0) {
                    idx.push(srv);
                    data.push(
                        {
                            name: srv,
                            model: _self.services[srv]
                        }
                    )
                }
            }
        }
        return {
            data: data,
            index: idx
        }
    }
    _self.getInterfaces = function () {
        return _self.getServices();
    }
    return _self;
})();