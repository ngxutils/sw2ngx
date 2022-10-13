"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SwaggerToAngularCodeGen = void 0;
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const tsyringe_1 = require("tsyringe");
const cli_helper_1 = require("./cli.helper");
const config_normalizer_1 = require("./config-normalizer");
const configuration_1 = require("./configuration");
const configuration_repository_1 = require("./configuration.repository");
const json_config_helper_1 = require("./json-config.helper");
const logger_1 = require("./logger");
const logo_1 = require("./logo");
const config_loader_1 = require("./parser/config.loader");
const parser_configuration_1 = require("./parser/parser.configuration");
const template_printer_service_1 = require("./printer/template-printer.service");
let SwaggerToAngularCodeGen = class SwaggerToAngularCodeGen {
    constructor(cliHelper, jsonConfigHelper, configNormalize, logger, configLoader, parsers, sw2ngxConfiguration, templatePrinter) {
        var _a;
        this.cliHelper = cliHelper;
        this.jsonConfigHelper = jsonConfigHelper;
        this.configNormalize = configNormalize;
        this.logger = logger;
        this.configLoader = configLoader;
        this.parsers = parsers;
        this.sw2ngxConfiguration = sw2ngxConfiguration;
        this.templatePrinter = templatePrinter;
        (_a = this.logger) === null || _a === void 0 ? void 0 : _a.ok(logo_1.logotype);
        this.run();
    }
    run() {
        this.parseInput()
            .pipe(operators_1.filter((x) => !!x), operators_1.tap((config) => { var _a; return (_a = this.sw2ngxConfiguration) === null || _a === void 0 ? void 0 : _a.config.next(config); }), operators_1.switchMap((config) => this.getConfig(config)), operators_1.switchMap((value) => {
            var _a;
            const availableParser = (_a = this.parsers) === null || _a === void 0 ? void 0 : _a.find((parser) => parser.supports(value));
            if (availableParser) {
                return availableParser === null || availableParser === void 0 ? void 0 : availableParser.parse(value);
            }
            else {
                return rxjs_1.throwError('NOT available parser for swagger/openapi config');
            }
        }))
            .subscribe((resp) => {
            var _a, _b;
            (_a = this.logger) === null || _a === void 0 ? void 0 : _a.ok('[ OK ] Parsing openapi configuration successfully!');
            (_b = this.templatePrinter) === null || _b === void 0 ? void 0 : _b.print(resp).subscribe(() => { var _a; return (_a = this.logger) === null || _a === void 0 ? void 0 : _a.ok('[ OK ] Generation successfully !'); });
        }, (err) => {
            var _a;
            return (_a = this.logger) === null || _a === void 0 ? void 0 : _a.err(`[ ERROR ]: Generation cancel with error (Stack Trace: ${JSON.stringify(err)} )`);
        });
    }
    parseInput() {
        var _a, _b, _c, _d, _e, _f;
        const configParams = (((_a = this.cliHelper) === null || _a === void 0 ? void 0 : _a.readCliParams()) ||
            {});
        let fromFilePresetConfig = {};
        if (configParams === null || configParams === void 0 ? void 0 : configParams.preset) {
            fromFilePresetConfig = (((_b = this.jsonConfigHelper) === null || _b === void 0 ? void 0 : _b.getConfig(configParams.preset)) || {});
        }
        const resultConfig = (_c = this.configNormalize) === null || _c === void 0 ? void 0 : _c.normalize(Object.assign(fromFilePresetConfig, configParams), true);
        if ((resultConfig === null || resultConfig === void 0 ? void 0 : resultConfig.parsingError) && !configParams.help) {
            (_d = this.logger) === null || _d === void 0 ? void 0 : _d.writeln('').writeln('').fg('yellow').writeln('[HELP ] try create sw2ngx.config.json and call `sw2ngx -preset /path/to/sw2ngx.config.json`').writeln('[HELP ] or use cli params:').writeln('').reset();
            (_e = this.cliHelper) === null || _e === void 0 ? void 0 : _e.printHelp();
            return rxjs_1.throwError('[ERROR] not found valid configuration for sw2ngx');
        }
        else if (configParams.help) {
            (_f = this.cliHelper) === null || _f === void 0 ? void 0 : _f.printHelp();
            return rxjs_1.EMPTY;
        }
        return rxjs_1.of(resultConfig);
    }
    getConfig(configuration) {
        if (configuration && this.configLoader) {
            return this.configLoader.loadConfig(configuration.config);
        }
        return rxjs_1.throwError('[ ERROR ]: swagger config loader service not found');
    }
};
SwaggerToAngularCodeGen = __decorate([
    tsyringe_1.autoInjectable(),
    tsyringe_1.registry([...configuration_1.configuration, ...parser_configuration_1.parserConfiguration]),
    __param(5, tsyringe_1.injectAll('PARSER')),
    __metadata("design:paramtypes", [cli_helper_1.CliHelper,
        json_config_helper_1.JsonConfigHelper,
        config_normalizer_1.Sw2NgxConfigNormalizer,
        logger_1.Logger,
        config_loader_1.SwaggerConfigLoader, Array, configuration_repository_1.ConfigurationRepository,
        template_printer_service_1.TemplatePrinterService])
], SwaggerToAngularCodeGen);
exports.SwaggerToAngularCodeGen = SwaggerToAngularCodeGen;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3cybmd4LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2xpYi9zdzJuZ3gudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsK0JBQXlEO0FBQ3pELDhDQUF3RDtBQUN4RCx1Q0FBK0Q7QUFLL0QsNkNBQXlDO0FBQ3pDLDJEQUE2RDtBQUM3RCxtREFBZ0Q7QUFDaEQseUVBQXFFO0FBQ3JFLDZEQUF3RDtBQUN4RCxxQ0FBa0M7QUFDbEMsaUNBQWtDO0FBQ2xDLDBEQUE2RDtBQUU3RCx3RUFBb0U7QUFDcEUsaUZBQTRFO0FBSTVFLElBQWEsdUJBQXVCLEdBQXBDLE1BQWEsdUJBQXVCO0lBQ2xDLFlBQ1UsU0FBcUIsRUFDckIsZ0JBQW1DLEVBQ25DLGVBQXdDLEVBQ3hDLE1BQWUsRUFDZixZQUFrQyxFQUNiLE9BQWdDLEVBQ3JELG1CQUE2QyxFQUM3QyxlQUF3Qzs7UUFQeEMsY0FBUyxHQUFULFNBQVMsQ0FBWTtRQUNyQixxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQW1CO1FBQ25DLG9CQUFlLEdBQWYsZUFBZSxDQUF5QjtRQUN4QyxXQUFNLEdBQU4sTUFBTSxDQUFTO1FBQ2YsaUJBQVksR0FBWixZQUFZLENBQXNCO1FBQ2IsWUFBTyxHQUFQLE9BQU8sQ0FBeUI7UUFDckQsd0JBQW1CLEdBQW5CLG1CQUFtQixDQUEwQjtRQUM3QyxvQkFBZSxHQUFmLGVBQWUsQ0FBeUI7UUFFaEQsTUFBQSxJQUFJLENBQUMsTUFBTSwwQ0FBRSxFQUFFLENBQUMsZUFBUSxDQUFDLENBQUM7UUFDMUIsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO0lBQ2IsQ0FBQztJQUNPLEdBQUc7UUFDVCxJQUFJLENBQUMsVUFBVSxFQUFFO2FBQ2QsSUFBSSxDQUNILGtCQUFNLENBQUMsQ0FBQyxDQUFDLEVBQXFCLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ3JDLGVBQUcsQ0FBQyxDQUFDLE1BQU0sRUFBRSxFQUFFLFdB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