import { injectable, injectAll, registry } from 'tsyringe';

import { Logger } from './logger';

@injectable()
@registry([
  {
    token: 'CLI_PARAM',
    useValue: {
      key: "-h",
      name: 'help',
      description: "show all commands and params",
      withoutValue: true,
      required: false,
      default: false
    }
  }
])
export class CliHelper{
  constructor(@injectAll('CLI_PARAM')private params: CliParam[] = [], private logger?: Logger) {
  }
  public readCliParams(): Sw2NgxConfig {
    return  this.getCliParams()
  }
  public printHelp() {

    for (const param of this.params) {
      let line = `${param.name}               `;
      line = line.substr(0, 18);
      const args = new Array(60).fill(' ');
      let i = 1;
      for (const arg of [param.key]) {
        args[i + 2] = arg;
        i = i + 2;
      }
      this.logger?.write(line).fg('yellow');
      line = args.join('');
      line = line.substr(0, 30);
      this.logger?.write(line).reset();
      line = '     ' + param.description;
      this.logger?.write(line);
      this.logger?.writeln('');
    }
    this.logger?.writeln('').writeln('').reset()
  }

  getCliParams(): Sw2NgxConfig {
    /** get all args from command line **/
    const args = process.argv;
    /**
     * create param map like:
     * {
     *   '-h': ICliParam
     * }
     * **/
    const paramsParserMap: Record<string, CliParam> = (this.params || []).reduce((prev,cur)=>{
      return {
        ...prev,
        [cur.key]: cur,
      }
    },{})

    /**
     * map cli args to Sw2NgxConfig
     * map may be not correct, need validation before use param
     * **/
    return args.reduce((prev: Sw2NgxConfig , cur, index)=>{
      const mappedConfigurationParam = paramsParserMap[cur as keyof typeof paramsParserMap]
      const mappedConfigurationParamValue =  mappedConfigurationParam?.withoutValue ? true: args[index+1]
      if(mappedConfigurationParam && mappedConfigurationParamValue){
        return {
          ...prev,
          [mappedConfigurationParam.name]:mappedConfigurationParamValue
        }
      }
      return prev
    }, {} as Sw2NgxConfig)
  }
}
