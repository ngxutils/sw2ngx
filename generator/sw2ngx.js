const ejs = require('ejs');
const _ = require('lodash');
const fs = require('fs');
const path  = require('path');
function color(string) {
    const _self = this;
    const help_colors = {
        reset: "\x1b[0m",
        bright: "\x1b[1m",
        dim: "\x1b[2m",
        underscore: "\x1b[4m",
        blink: "\x1b[5m",
        reverse: "\x1b[7m",
        hidden: "\x1b[8m"
    }
    const text = {
        black: "\x1b[30m",
        red: "\x1b[31m",
        green: "\x1b[32m",
        yellow: "\x1b[33m",
        blue: "\x1b[34m",
        magenta: "\x1b[35m",
        cyan: "\x1b[36m",
        white: "\x1b[37m",
    };
    const background = {
        black: "\x1b[40m",
        red: "\x1b[41m",
        green: "\x1b[42m",
        yellow: "\x1b[43m",
        blue: "\x1b[44m",
        magenta: "\x1b[45m",
        cyan: "\x1b[46m",
        white: "\x1b[47m"
    }
    _self.reset = function () {
        process.stdout.write(help_colors.reset);
        return _self;
    }
    _self.bg = function (color) {
        process.stdout.write(background[color]);
        return _self;

    }
    _self.fg = function (cl) {
        process.stdout.write(text[cl]);
        return _self;
    }
    _self.write = function (string) {
        process.stdout.write(string);
        return _self;
    }
    _self.writeln = function (string) {
        process.stdout.write(string);
        process.stdout.write('\r\n');
        return _self;
    }

    return _self;
}

const logger = color();



function resolveImports(imports){
    const result = [];
    for(const imp of imports){
        if(result.indexOf(imp)=== -1){
            if(imp!==null){
                result.push(imp);
            }
        }
    }
    return result;
}
function extractEnum(str){
    const result = [];
    var indexOf = str.search(/\(\d/ig);
    console.log(indexOf);
    let temp = str.substr(indexOf+1).replace(')', '');
    temp = temp.split(',');
    for(let tmp of temp){;
        let key = tmp.split('=');
        result.push(
            {key:key[1], val: key[0]}
        );
    }
    console.log(result);
    return result;
}
function resolveType(prop, name){
    console.log(prop);
    if((!prop.enum)&&(!prop.format)){
        if(prop.type==='string'){
            return ['string',null];
        }
        if(prop.type==='boolean'){
            return ['boolean',null];
        }
        if(prop.$ref!==undefined){
            const temp = prop.$ref.split('/'); 
            return [temp[temp.length-1], temp[temp.length-1]];
        }
        if(prop.type='array'){
            temp = resolveType(prop.items);
            return [temp[0]+"[]", temp[1]?temp[1]:null];
            console.log(temp);
        }
    } else {
        if(prop.enum!==undefined){
            console.log(extractEnum(prop.description));
            return [name, name];
        }
        if(prop.format){
            switch (prop.format) {
                case 'date-time':
                    return ['Date',null];
                    break;
                case 'int32':
                    return ['number', null];
                    break;
                default:
                    return [null,null];
                    break;
            }
        }
        return [null,null];
    }

}
function genModelProp(name, prop){
    const resolvedType =  resolveType(prop, name);
    console.log(resolvedType);
    return {
        name: name,
        type: resolvedType[0],
        imports: resolvedType[1],
        description: prop.description!=='' ? prop.description: ''
    }
}
function genModels(models){
    const log = color()
                .reset();
    const result = [];
    for(const key in models) {
        const model = {
            description: '',
            imports: [],
            props:[]
        }
        if (models.hasOwnProperty(key)!==-1){
            const imports = [];
            log.fg('yellow').write(key).reset();
            model.name =  key;
            model.description = models[key].description;
            for(const prop in models[key].properties){
                if(models[key].properties.hasOwnProperty(prop)!== -1){
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

function saveModel(basePath, model){
    if (!fs.existsSync(basePath)) {
        fs.mkdirSync(basePath);
        if(!fs.existsSync(basePath+'/models')){
            fs.mkdirSync(basePath+'/models');
        }
    }
    const template = fs.readFileSync(path.resolve(__dirname,'./templates/model.ejs'), 'utf-8');
    const compiler = ejs.compile(template,{});
    const result = compiler({model});
    fs.writeFile(basePath+'/models/'+model.name.toLowerCase()+'.model.ts', result, function(err) {
        if(err) {
            logger.fg('red').write('['+model.name+']').writeln(err).reset();
        }
        
        logger.fg('green').write("---").fg('yellow').write(model.name).writeln(" [ + ]").reset();
    }); 
}
function saveModelIndex(basePath,modelsList) { 
    if (!fs.existsSync(basePath)) {
        fs.mkdirSync(basePath);
        if(!fs.existsSync(basePath+'/models')){
            fs.mkdirSync(basePath+'/models');
        }
    }
    const template = fs.readFileSync(path.resolve(__dirname,'./templates/index.models.ejs'), 'utf-8');
    const compiler = ejs.compile(template,{});
    const result = compiler({modelsList});
    fs.writeFile(basePath+'/models/index.ts', result, function(err) {
        if(err) {
            logger.fg('red').write('[ INDEX! ]').writeln(err).reset();
        }
        
        logger.fg('green').write("---").fg('yellow').write('index').writeln(" [ + ]").reset();
    }); 
}
function saveEnum() {
    if (!fs.existsSync(basePath)) {
        fs.mkdirSync(basePath);
        if(!fs.existsSync(basePath+'/models')){
            fs.mkdirSync(basePath+'/models');
            if(!fs.existsSync(basePath+'/models/enums')){
                fs.mkdirSync(basePath+'/models/enums');
            }
        }
    }

}
function saveInterface(){

}
function saveService(){

}
function createModule(){

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
        const log = color()
            .fg('green')
            .writeln('')
            .write('[HELP]')
            .write(':')
            .writeln('')
           
            .reset();
        log.writeln('');
        for (const key of keys) {
            let string = `     ${key.param}          `;
            string = string.substr(0,15);
            let args = new Array(40).fill(' ');
            let i = 1;
            for (const arg of key.keys) {
                args[i + 2] = arg;
                i = i + 2;
            }
           // console.log(args);
            log.write(string)
            .fg('yellow');
            args = args.join('');
            string = args.substr(0,20);
            log.write(string)
            .reset();
            string = '     ' + key.description;
            log.write(string);
            log.writeln('');
        }
        return;
    } else{
        const swagger = JSON.parse(fs.readFileSync(params.config, 'utf-8')); 
        const models = genModels(swagger.definitions);
        const modelsList = [];
        logger.fg('green').writeln(params.out+'/models/').reset();
        for(const model of models) {
            modelsList.push(model.name);
            saveModel(params.out, model);
            
        }
        saveModelIndex(params.out, modelsList);
    }
}
main();