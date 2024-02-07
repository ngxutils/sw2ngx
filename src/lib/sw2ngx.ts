import { EMPTY, Observable, of, throwError } from 'rxjs';
import { filter, switchMap, tap } from 'rxjs/operators';
import { autoInjectable, injectAll, registry } from 'tsyringe';

import { OpenApiV3 } from '../types/openapi';
import { OpenApiV2 } from '../types/swagger';

import { CliHelper } from './cli.helper';
import { Sw2NgxConfigNormalizer } from './config-normalizer';
import { configuration } from './configuration';
import { ConfigurationRepository } from './configuration.repository';
import { JsonConfigHelper } from './json-config.helper';
import { Logger } from './logger';
import { logotype } from './logo';
import { SwaggerConfigLoader } from './parser/config.loader';
import { IOpenApiParserPlugin } from './parser/open-api-parser.plugin';
import { parserConfiguration } from './parser/parser.configuration';
import { TemplatePrinterService } from './printer/template-printer.service';

@autoInjectable()
@registry([...configuration, ...parserConfiguration])
export class SwaggerToAngularCodeGen {
  constructor(
    private cliHelper?: CliHelper,
    private jsonConfigHelper?: JsonConfigHelper,
    private configNormalize?: Sw2NgxConfigNormalizer,
    private logger?: Logger,
    private configLoader?: SwaggerConfigLoader,
    @injectAll('PARSER') private parsers?: IOpenApiParserPlugin[],
    private sw2ngxConfiguration?: ConfigurationRepository,
    private templatePrinter?: TemplatePrinterService
  ) {
    this.logger?.ok(logotype);
    this.run();
  }
  private run() {
    this.parseInput()
      .pipe(
        filter((x): x is Sw2NgxConfig => !!x),
        tap((config) => this.sw2ngxConfiguration?.config.next(config)),
        switchMap((config: Sw2NgxConfig) => this.getConfig(config)),
        switchMap(
          (value: OpenApiV2 | OpenApiV3): Observable<Sw2NgxApiDefinition> => {
            const availableParser = this.parsers?.find((parser) =>
              parser.supports(value)
            );
            if (availableParser) {
              return availableParser?.parse(value);
            } else {
              return throwError(
                'NOT available parser for swagger/openapi config'
              );
            }
          }
        )
      )
      .subscribe(
        (resp) => {
          this.logger?.ok('[ OK ] Parsing openapi configuration successfully!');
          this.templatePrinter
            ?.print(resp)
            .subscribe(() =>
              this.logger?.ok('[ OK ] Generation successfully !')
            );
        },
        (err) =>
        {this.logger?.err(
            `[ ERROR ]: Generation cancel with error (Stack Trace:
              ${err}
             )`
          )
        }
      );
  }
  private parseInput(): Observable<Sw2NgxConfig | undefined> {
    const configParams = (this.cliHelper?.readCliParams() ||
      {}) as Sw2NgxConfig;
    let fromFilePresetConfig: Sw2NgxConfig = {} as Sw2NgxConfig;

    if (configParams?.preset) {
      fromFilePresetConfig = (this.jsonConfigHelper?.getConfig(
        configParams.preset
      ) || {}) as Sw2NgxConfig;
    }
    const resultConfig = this.configNormalize?.normalize(
      Object.assign<Sw2NgxConfig, Sw2NgxConfig>(
        fromFilePresetConfig,
        configParams
      ),
      true
    );

    if (resultConfig?.parsingError && !configParams.help) {
      this.logger
        ?.writeln('')
        .writeln('')
        .fg('yellow')
        .writeln(
          '[HELP ] try create sw2ngx.config.json and call `sw2ngx -preset /path/to/sw2ngx.config.json`'
        )
        .writeln('[HELP ] or use cli params:')
        .writeln('')
        .reset();
      this.cliHelper?.printHelp();
      return throwError('[ERROR] not found valid configuration for sw2ngx');
    } else if (configParams.help) {
      this.cliHelper?.printHelp();
      return EMPTY;
    }
    return of(resultConfig);
  }
  private getConfig(
    configuration: Sw2NgxConfig | undefined
  ): Observable<OpenApiV2 | OpenApiV3> {
    if (configuration && this.configLoader) {
      return this.configLoader.loadConfig(configuration.config);
    }
    return throwError('[ ERROR ]: swagger config loader service not found');
  }
}
