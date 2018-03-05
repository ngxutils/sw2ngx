#!/usr/bin/env node

const ejs = require('ejs');
const fs = require('fs');
const path = require('path');
const rmrf = require('rimraf');
const logger = require('./utils/logger');
const parser = require('./utils/parser');


const generator = (function(){
    const _self = this;
    let templates = {
        "module":{
            "path": "/",
            "index": null,
            "base": "./templates/module.ejs",
            "suffics": "api.module.ts"
        },
        "models":{
            "path": "/models/",
            "index": "./templates/index.models.ejs",
            "base": "./templates/model.ejs",
            "suffics": ".model.ts"
        },
        "services": {
            "path": "/services/",
            "index": "./templates/index.services.ejs",
            "base": "./templates/service.ejs",
            "suffics": ".service.ts"
        },
        "enums": {
            "path": "/models/enums/",
            "index": "./templates/index.enum.ejs",
            "base": "./templates/enum.ejs",
            "suffics": ".enum.ts"
        },
        "interfaces": {
            "path":"/services/interfaces/",
            "index": "./templates/index.interfaces.ejs",
            "base": "./templates/interface.ejs",
            "suffics": ".interface.ts"
        }
    };
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
    _self.printHelp = function(){
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
    }
    _self.publish = function(templateName, data, basePath){
        const template  =  templates[templateName];
        if(template){
            const index = [];
            if(data.data){
                const tmpl = fs.readFileSync(path.resolve(__dirname, template.base), 'utf-8');
                for (let item of data.data){
                    let compiler = ejs.compile(tmpl, {});
                    let result = compiler({
                        name: item.name,
                        model: item.model
                    });
                    fs.writeFile(basePath+ template.path + item.name + template.suffics, result, function (err) {
                        if (err) {
                            logger.fg('red').write('[' + item.name + ']').writeln(err).reset();
                        }

                        logger.fg('green').write("---").fg('yellow').write(item.name).writeln(" [ + ]").reset();
                    });
                }
            }
            if(data.index){
                const tmplIndex = fs.readFileSync(path.resolve(__dirname, template.index), 'utf-8');
                const compiler = ejs.compile(tmplIndex, {});
                const result = compiler({
                    list: data.index
                });
                fs.writeFile(basePath+ template.path +'index.ts', result, function (err) {
                    if (err) {
                        logger.fg('red').write('[ INDEX ]').writeln(err).reset();
                    }

                    logger.fg('green').write("---").fg('yellow').write('index').writeln(" [ + ]").reset();
                });
            }
        }else {
            logger.fg('red').writeln('ERROR: templateName not found!').reset();
        }

    }
    _self.clearFolder = function(basePath){
        return new Promise(
            (resolve, reject)=>{
                rmrf(basePath, ()=> resolve(''));
            }
        );
    }
    _self.genFolders = function(basePath){
        for (let key in templates){
            if(templates.hasOwnProperty(key)){
                if (!fs.existsSync(path.resolve(basePath + templates[key].path))) {
                    fs.mkdirSync(path.resolve(basePath + templates[key].path));
                }
            }   
        }
    }
    _self.parseArgs = function(){
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
    _self.gen = function(){
        const params = _self.parseArgs();
        if (params.help === true) {
            _self.printHelp();
        } else {
            // get swagger json
            const swagger = JSON.parse(fs.readFileSync(params.config, 'utf-8'));
            parser.parseModels(swagger.definitions);
            parser.parseServices(swagger.paths, swagger.basePath);
            /* clean folder */
            _self.clearFolder(params.out).then(()=>{
                _self.genFolders(params.out);
                /* generate Files */
                _self.publish("enums", parser.getEnums(), params.out);
                _self.publish("models", parser.getModels(), params.out);
                _self.publish("services", parser.getServices(), params.out);
                _self.publish("interfaces", parser.getInterfaces(), params.out);
                _self.publish("module", parser.getModule(), params.out);
            });
            
        } 
    }
    _self.gen();
})();




module.exports = generator;