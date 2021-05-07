import { EMPTY, Observable, of, throwError } from 'rxjs';
import {
  filter,
  map, switchMap, tap
} from 'rxjs/operators';
import { autoInjectable, injectAll, registry } from 'tsyringe';

import {
  OpenApiV3
} from '../types/openapi';
import { OpenApiV2 } from '../types/swagger';

import { CliHelper } from './cli.helper';
import { Sw2NgxConfigNormalizer } from './config-normalizer';
import { configuration } from './configuration';
import { JsonConfigHelper } from './json-config.helper';
import { Logger } from './logger';
import { logotype } from './logo';
import { SwaggerConfigLoader } from './parser/config.loader';
import { IOpenApiParserPlugin } from './parser/open-api-parser.plugin';
import { parserConfiguration } from './parser/parser.configuration';

@autoInjectable()
@registry([
  ...configuration,
  ...parserConfiguration,
])
export class SwaggerToAngularCodeGen {
  constructor(
    private cliHelper?: CliHelper,
    private jsonConfigHelper?: JsonConfigHelper,
    private configNormalize?: Sw2NgxConfigNormalizer,
    private logger?: Logger,
    private configLoader?: SwaggerConfigLoader,
    @injectAll('PARSER') private parsers?: IOpenApiParserPlugin[]
    ) {
    this.logger?.ok(logotype)
    this.run()
  }
  private run(){
    this.parseInput()
      .pipe(
        filter((x)=>!!x),
        tap((x)=> console.log(x)),
        switchMap((config)=>this.getConfig(config)),
        tap((x)=> console.log(x)),
        map((value)=>{
          const availableParser = this.parsers?.find((parser)=> parser.supports(value))
          console.log(availableParser)
          return availableParser?.parse(value)
        })
    )
      .subscribe(
        ()=> this.logger?.ok('[ OK ] Generation successfully!'),
        (err)=>this.logger?.err(`[ ERROR ]: Generation cancel with error (Stack Trace: ${JSON.stringify(err)} )`))
  }
  private parseInput(): Observable<Sw2NgxConfig | undefined>{

    const configParams = (this.cliHelper?.readCliParams() || {}) as Sw2NgxConfig;
    let fromFilePresetConfig: Sw2NgxConfig = {} as Sw2NgxConfig

    if(configParams?.preset){
      fromFilePresetConfig = (this.jsonConfigHelper?.getConfig(configParams.preset) || {}) as Sw2NgxConfig
    }

    const resultConfig = this.configNormalize?.normalize(Object.assign<Sw2NgxConfig, Sw2NgxConfig>(fromFilePresetConfig, configParams), true)

    if(resultConfig?.parsingError && !configParams.help){
      this.logger?.writeln('').writeln('')
        .fg('yellow')
        .writeln('[HELP ] try create sw2ngx.config.json and call `sw2ngx -preset /path/to/sw2ngx.config.json`')
        .writeln('[HELP ] or use cli params:')
        .writeln('')
        .reset()
      this.cliHelper?.printHelp()
      return throwError("[ERROR] not found valid configuration for sw2ngx")
    }else if(configParams.help){
      this.cliHelper?.printHelp()
      return EMPTY
    }
    return of(resultConfig)
  }
  private getConfig(configuration: Sw2NgxConfig| undefined): Observable<OpenApiV2| OpenApiV3>{
    if(configuration && this.configLoader){
      return this.configLoader.loadConfig(configuration.config)
    }
    return throwError("[ ERROR ]: swagger config loader service not found")
  }

}
