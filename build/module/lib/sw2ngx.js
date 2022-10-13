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
import { EMPTY, of, throwError } from 'rxjs';
import { filter, switchMap, tap } from 'rxjs/operators';
import { autoInjectable, injectAll, registry } from 'tsyringe';
import { CliHelper } from './cli.helper';
import { Sw2NgxConfigNormalizer } from './config-normalizer';
import { configuration } from './configuration';
import { ConfigurationRepository } from './configuration.repository';
import { JsonConfigHelper } from './json-config.helper';
import { Logger } from './logger';
import { logotype } from './logo';
import { SwaggerConfigLoader } from './parser/config.loader';
import { parserConfiguration } from './parser/parser.configuration';
import { TemplatePrinterService } from './printer/template-printer.service';
let SwaggerToAngularCodeGen = class SwaggerToAngularCodeGen {
    cliHelper;
    jsonConfigHelper;
    configNormalize;
    logger;
    configLoader;
    parsers;
    sw2ngxConfiguration;
    templatePrinter;
    constructor(cliHelper, jsonConfigHelper, configNormalize, logger, configLoader, parsers, sw2ngxConfiguration, templatePrinter) {
        this.cliHelper = cliHelper;
        this.jsonConfigHelper = jsonConfigHelper;
        this.configNormalize = configNormalize;
        this.logger = logger;
        this.configLoader = configLoader;
        this.parsers = parsers;
        this.sw2ngxConfiguration = sw2ngxConfiguration;
        this.templatePrinter = templatePrinter;
        this.logger?.ok(logotype);
        this.run();
    }
    run() {
        this.parseInput()
            .pipe(filter((x) => !!x), tap((config) => this.sw2ngxConfiguration?.config.next(config)), switchMap((config) => this.getConfig(config)), switchMap((value) => {
            const availableParser = this.parsers?.find((parser) => parser.supports(value));
            if (availableParser) {
                return availableParser?.parse(value);
            }
            else {
                return throwError('NOT available parser for swagger/openapi config');
            }
        }))
            .subscribe((resp) => {
            this.logger?.ok('[ OK ] Parsing openapi configuration successfully!');
            this.templatePrinter
                ?.print(resp)
                .subscribe(() => this.logger?.ok('[ OK ] Generation successfully !'));
        }, (err) => this.logger?.err(`[ ERROR ]: Generation cancel with error (Stack Trace: ${JSON.stringify(err)} )`));
    }
    parseInput() {
        const configParams = (this.cliHelper?.readCliParams() ||
            {});
        let fromFilePresetConfig = {};
        if (configParams?.preset) {
            fromFilePresetConfig = (this.jsonConfigHelper?.getConfig(configParams.preset) || {});
        }
        const resultConfig = this.configNormalize?.normalize(Object.assign(fromFilePresetConfig, configParams), true);
        if (resultConfig?.parsingError && !configParams.help) {
            this.logger
                ?.writeln('')
                .writeln('')
                .fg('yellow')
                .writeln('[HELP ] try create sw2ngx.config.json and call `sw2ngx -preset /path/to/sw2ngx.config.json`')
                .writeln('[HELP ] or use cli params:')
                .writeln('')
                .reset();
            this.cliHelper?.printHelp();
            return throwError('[ERROR] not found valid configuration for sw2ngx');
        }
        else if (configParams.help) {
            this.cliHelper?.printHelp();
            return EMPTY;
        }
        return of(resultConfig);
    }
    getConfig(configuration) {
        if (configuration && this.configLoader) {
            return this.configLoader.loadConfig(configuration.config);
        }
        return throwError('[ ERROR ]: swagger config loader service not found');
    }
};
SwaggerToAngularCodeGen = __decorate([
    autoInjectable(),
    registry([...configuration, ...parserConfiguration]),
    __param(5, injectAll('PARSER')),
    __metadata("design:paramtypes", [CliHelper,
        JsonConfigHelper,
        Sw2NgxConfigNormalizer,
        Logger,
        SwaggerConfigLoader, Array, ConfigurationRepository,
        TemplatePrinterService])
], SwaggerToAngularCodeGen);
export { SwaggerToAngularCodeGen };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3cybmd4LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2xpYi9zdzJuZ3gudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUEsT0FBTyxFQUFFLEtBQUssRUFBYyxFQUFFLEVBQUUsVUFBVSxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBQ3pELE9BQU8sRUFBRSxNQUFNLEVBQUUsU0FBUyxFQUFFLEdBQUcsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBQ3hELE9BQU8sRUFBRSxjQUFjLEVBQUUsU0FBUyxFQUFFLFFBQVEsRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUsvRCxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sY0FBYyxDQUFDO0FBQ3pDLE9BQU8sRUFBRSxzQkFBc0IsRUFBRSxNQUFNLHFCQUFxQixDQUFDO0FBQzdELE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUNoRCxPQUFPLEVBQUUsdUJBQXVCLEVBQUUsTUFBTSw0QkFBNEIsQ0FBQztBQUNyRSxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxzQkFBc0IsQ0FBQztBQUN4RCxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sVUFBVSxDQUFDO0FBQ2xDLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxRQUFRLENBQUM7QUFDbEMsT0FBTyxFQUFFLG1CQUFtQixFQUFFLE1BQU0sd0JBQXdCLENBQUM7QUFFN0QsT0FBTyxFQUFFLG1CQUFtQixFQUFFLE1BQU0sK0JBQStCLENBQUM7QUFDcEUsT0FBTyxFQUFFLHNCQUFzQixFQUFFLE1BQU0sb0NBQW9DLENBQUM7QUFJNUUsSUFBYSx1QkFBdUIsR0FBcEMsTUFBYSx1QkFBdUI7SUFFeEI7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNxQjtJQUNyQjtJQUNBO0lBUlYsWUFDVSxTQUFxQixFQUNyQixnQkFBbUMsRUFDbkMsZUFBd0MsRUFDeEMsTUFBZSxFQUNmLFlBQWtDLEVBQ2IsT0FBZ0MsRUFD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