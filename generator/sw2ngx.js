const ejs = require('ejs');
const fs = require('fs');
const path = require('path');
const logger = require('./logger');

let models = [];
let enums = [];
let serivces = [];

function genServices(paths, baseURI) {
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
                    let parsedMethod = parseMethod(path, method, paths[path][method]);
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
    result = resolveServiceImports(result);
    return result;
}

function resolveServiceImports(servicesList) {
    for (let serv in servicesList) {
        if (servicesList.hasOwnProperty(serv)) {
            let imports = [];
            for (let method of servicesList[serv].methods) {
                if (method.resp.imports !== null) {
                    imports.push(method.resp.imports);
                }
                
                for (let param of method.params.uri) {
                    if(param.type[1]){
                        imports.push(param.type[1]);
                    }
                }

                for (let param of method.params.query) {
                    if(param.type[1]){
                        imports.push(param.type[1]);
                    }
                }
                
                for (let param of method.params.payload) {
                    if(param.type[1]){
                        imports.push(param.type[1]);
                    }
                }
                
            }
            servicesList[serv].imports =  resolveImports(imports);
        }
    }
    return servicesList;
}



function parseMethod(uri, type, method) {
    return {
        uri: uri.replace(/\{/ig,'${'),
        type: type,
        tag: parseTags(method.tags),
        name: method.operationId,
        description: method.summary,
        params: parseParams(method.parameters),
        resp: parseResponse(method.responses)
    }
}

function parseTags(tags) {
    let result = '';
    if (tags.length >= 1) {
        return tags[0];
    } else {
        return '__common'
    }
}

function parseResponse(responses) {
    if (responses['200']) {
        if (responses['200']['schema']) {
            const resolvedType = resolveType(responses['200']['schema'],'response');
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

function parseParams(params) {
    const parsed = {
        all: [],
        uri: [],
        query: [],
        payload: [], 
        form:[]
    };
    for (const param in params) {
        if (params.hasOwnProperty(param)) {
            let type = [];
            if(params[param].schema){
                type = resolveType(params[param].schema,params[param].name);
            }else{
                type = resolveType(params[param],params[param].name);
            }
            let res = {
                name: params[param].name.replace(/\.|\-/ig,''),
                query_name: params[param].name,
                description: params[param].description,
                required: params[param].required,
                type: type
            }
            if(params[param].in === 'path'){
                parsed.uri.push(res);
            }
            if(params[param].in === 'query'){
                parsed.query.push(res);
            }
            if(params[param].in === 'body'){
                parsed.payload.push(res);
            }
            if(params[param].in === 'formData'){
                parsed.form.push(res);
            }
            parsed.all.push(res);
        }
    }
    return parsed;
}


function resolveImports(imports) {
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

function extractEnum(str, propEnum) {
    const result = [];
    var indexOf = str.search(/\(\d/ig);
    if(indexOf!==-1){
        let temp = str.substr(indexOf + 1).replace(')', '');
        temp = temp.split(',');
        for (let tmp of temp) {;
            let key = tmp.split('=');
            result.push({
                key: key[1],
                val: key[0]
            });
        }
    }else{
        for(var key in propEnum){
            if(propEnum.hasOwnProperty(key)){
                result.push(
                    {
                        key: 'enum'+key,
                        val: propEnum[key]
                    }
                )
            }
        }
    }
    return result;
}

function resolveType(prop, name) {
    let curname = name.replace(/\.|\-/ig,'_');
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
            temp = resolveType(prop.items, curname);
            return [temp[0] + "[]", temp[1] ? temp[1] : null];
        }
        if (prop.type ==='object'){
            return ['any', null];
        }
    } else {
        if (prop.enum !== undefined) {
            const temp = extractEnum(prop.description, prop.enum);
            let dublicate = '';
            let equals = false;
            for(let item of enums){
                if(item.name.toLowerCase() === curname.toLowerCase()){
                    dublicate = item;

                    if(item.props.length===temp.length){

                        equals = true;
                        for(var i=0;i<item.props.length;i++){
                            
                            if((item.props[i].key!==temp[i].key)||(item.props[i].val!==temp[i].val)){
                                equals = false;
                                break;
                            }
                        }
                    }
                    break;
                }
            }
            if((dublicate!=='')&&equals){
                return [dublicate.name, dublicate.name];
            }
            if((dublicate!=='')&&(!equals)){
                enums.push({
                    name: curname+'_other',
                    props: temp
                });    
                return [curname+'_other', curname+'_other'];
            }
            enums.push({
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

function genModelProp(name, prop) {
    const resolvedType = resolveType(prop, name);
    return {
        name: name,
        type: resolvedType[0],
        imports: resolvedType[1],
        description: prop.description !== '' ? prop.description : ''
    }
}

function genModels(models) {
    const result = [];
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
                    const temp = genModelProp(prop, models[key].properties[prop]);
                    imports.push(temp.imports);
                    model.props.push(temp);
                }
            }
            model.imports = resolveImports(imports);
        }
        result.push(model);
    }
    return result;
}

function saveModel(basePath, model) {
    if (!fs.existsSync(basePath)) {
        fs.mkdirSync(basePath);
        if (!fs.existsSync(basePath + '/models')) {
            fs.mkdirSync(basePath + '/models');
        }
    }
    const template = fs.readFileSync(path.resolve(__dirname, './templates/model.ejs'), 'utf-8');
    const compiler = ejs.compile(template, {});
    const result = compiler({
        model
    });
    fs.writeFile(basePath + '/models/' + model.name.toLowerCase() + '.model.ts', result, function (err) {
        if (err) {
            logger.fg('red').write('[' + model.name + ']').writeln(err).reset();
        }

        logger.fg('green').write("---").fg('yellow').write(model.name).writeln(" [ + ]").reset();
    });
}

function saveModelIndex(basePath, modelsList) {
    const template = fs.readFileSync(path.resolve(__dirname, './templates/index.models.ejs'), 'utf-8');
    const compiler = ejs.compile(template, {});
    const result = compiler({
        modelsList
    });
    fs.writeFile(basePath + '/models/index.ts', result, function (err) {
        if (err) {
            logger.fg('red').write('[ INDEX! ]').writeln(err).reset();
        }

        logger.fg('green').write("---").fg('yellow').write('index').writeln(" [ + ]").reset();
    });
}

function saveEnum(basePath, elem) {

    if (!fs.existsSync(basePath + '/models/enums')) {
        fs.mkdirSync(basePath + '/models/enums');
    }

    const template = fs.readFileSync(path.resolve(__dirname, './templates/enum.ejs'), 'utf-8');
    const compiler = ejs.compile(template, {});
    const result = compiler({
        elem
    });
    fs.writeFile(basePath + '/models/enums/' + elem.name + '.ts', result, function (err) {
        if (err) {
            logger.fg('red').write('[ INDEX! ]').writeln(err).reset();
        }

        logger.fg('green').write("---").fg('yellow').write('enums/' + elem.name + '.ts').writeln(" [ + ]").reset();
    });
}

function saveEnumIndex(basePath, enumsList) {
    const template = fs.readFileSync(path.resolve(__dirname, './templates/index.enum.ejs'), 'utf-8');
    const compiler = ejs.compile(template, {});
    const result = compiler({
        enumsList
    });
    fs.writeFile(basePath + '/models/enums/index.ts', result, function (err) {
        if (err) {
            logger.fg('red').write('[ INDEX! ]').writeln(err).reset();
        }

        logger.fg('green').write("---").fg('yellow').write('index').writeln(" [ + ]").reset();
    });
}

function saveInterface(basePath,srvName,srv) {
    if (!fs.existsSync(basePath)) {
        fs.mkdirSync(basePath);   
    }
    if (!fs.existsSync(basePath + '/services')) {
        fs.mkdirSync(basePath + '/services');
    }
    if (!fs.existsSync(basePath + '/services/interfaces')) {
        fs.mkdirSync(basePath + '/services/interfaces');
    }
    const template = fs.readFileSync(path.resolve(__dirname, './templates/interface.ejs'), 'utf-8');
    const compiler = ejs.compile(template, {});
    const result = compiler({
        name: srvName,
        service: srv
    });
    fs.writeFile(basePath + '/services/interfaces/' + srvName.toLowerCase() + '.interface.ts', result, function (err) {
        if (err) {
            logger.fg('red').write('[' + srvName + ']').writeln(err).reset();
        }

        logger.fg('green').write("---").fg('yellow').write(srvName).writeln(" [ + ]").reset();
    });
}

function saveService(basePath,srvName,srv) {
    if (!fs.existsSync(basePath)) {
        fs.mkdirSync(basePath);   
    }
    if (!fs.existsSync(basePath + '/services')) {
        fs.mkdirSync(basePath + '/services');
    }
    const template = fs.readFileSync(path.resolve(__dirname, './templates/service.ejs'), 'utf-8');
    const compiler = ejs.compile(template, {});
    const result = compiler({
        name: srvName,
        service: srv
    });
    fs.writeFile(basePath + '/services/' + srvName.toLowerCase() + '.service.ts', result, function (err) {
        if (err) {
            logger.fg('red').write('[' + srvName + ']').writeln(err).reset();
        }

        logger.fg('green').write("---").fg('yellow').write(srvName).writeln(" [ + ]").reset();
    });
}

function saveServiceIndex(basePath, servicesList) {
    const template = fs.readFileSync(path.resolve(__dirname, './templates/index.services.ejs'), 'utf-8');
    const compiler = ejs.compile(template, {});
    const result = compiler({
        servicesList
    });
    fs.writeFile(basePath + '/services/index.ts', result, function (err) {
        if (err) {
            logger.fg('red').write('[ INDEX! ]').writeln(err).reset();
        }

        logger.fg('green').write("---").fg('yellow').write('index').writeln(" [ + ]").reset();
    });
}
function saveInterfaceIndex(basePath, servicesList) {
    const template = fs.readFileSync(path.resolve(__dirname, './templates/index.interfaces.ejs'), 'utf-8');
    const compiler = ejs.compile(template, {});
    const result = compiler({
        servicesList
    });
    fs.writeFile(basePath + '/services/interfaces/index.ts', result, function (err) {
        if (err) {
            logger.fg('red').write('[ INDEX! ]').writeln(err).reset();
        }

        logger.fg('green').write("---").fg('yellow').write('index').writeln(" [ + ]").reset();
    });
}


function createModule(basePath, servicesList) {
    const template = fs.readFileSync(path.resolve(__dirname, './templates/module.ejs'), 'utf-8');
    const compiler = ejs.compile(template, {});
    const result = compiler({
        servicesList
    });
    fs.writeFile(basePath + '/api.module.ts', result, function (err) {
        if (err) {
            logger.fg('red').write('[ INDEX! ]').writeln(err).reset();
        }

        logger.fg('green').write("---").fg('yellow').write('index').writeln(" [ + ]").reset();
    });
}

function getArgs(keys) {
    let response = {};
    const args = process.argv;
    for (let i = 0; i < args.length; i++) {
        for (const key of keys) {
            if (key.keys.indexOf(args[i]) !== -1) {
                if (key.noValue) {
                    response[key.param] = true;
                    break;
                } else {
                    response[key.param] = args[i + 1];
                    i++;
                    break;
                }
            }
        }
    }
    return response;
}

function main() {
    const keys = [{
            param: 'config',
            keys: ['-c', '--c'],
            noValue: false,
            description: 'Swagger doc path'
        },
        {
            param: 'out',
            keys: ['-o', '--o'],
            noValue: false,
            description: 'Output directory'
        },
        {
            param: 'help',
            keys: [
                '-h', '--h', 'help', '-help'
            ],
            noValue: true,
            description: 'Call help'
        }
    ];
    const params = getArgs(keys);
    if (params.help === true) {
        logger
            .fg('green')
            .writeln('')
            .write('[HELP]')
            .write(':')
            .writeln('')
            .reset()
            .writeln('');
        for (const key of keys) {
            let string = `     ${key.param}          `;
            string = string.substr(0, 15);
            let args = new Array(40).fill(' ');
            let i = 1;
            for (const arg of key.keys) {
                args[i + 2] = arg;
                i = i + 2;
            }
            logger.write(string)
                .fg('yellow');
            args = args.join('');
            string = args.substr(0, 20);
            logger.write(string)
                .reset();
            string = '     ' + key.description;
            logger.write(string);
            logger.writeln('');
        }
        return;
    } else {
        const swagger = JSON.parse(fs.readFileSync(params.config, 'utf-8'));
        models = genModels(swagger.definitions);
        serivces = genServices(swagger.paths, swagger.basePath);
        const modelsList = [];
        const enumsList = [];
        const serviceList = [];
        logger.fg('green').writeln(params.out + '/models/').reset();
        for (const model of models) {
            modelsList.push(model.name);
            saveModel(params.out, model);

        }
        for (const elem of enums) {
            enumsList.push(elem.name);
            saveEnum(params.out, elem);
        }
        
        for (const srv in serivces){
            if(serivces.hasOwnProperty(srv)){
                if(serivces[srv].methods.length>0){
                    serviceList.push(srv);
                    saveService(params.out, srv, serivces[srv]);
                    saveInterface(params.out, srv, serivces[srv]);
                }
            }
        }
        
        saveEnumIndex(params.out, enumsList);
        saveModelIndex(params.out, modelsList);
        saveServiceIndex(params.out, serviceList);
        saveInterfaceIndex(params.out, serviceList);
        createModule(params.out, serviceList);
    }
}
main();