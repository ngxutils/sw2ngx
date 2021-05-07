import { Logger } from './logger';
import { GeneratorParams } from '../interfaces/params';
import { IGeneratorConfig } from '../interfaces/config';

export class HelpCLI {
  public logger: Logger = new Logger();
  public parseArgs(): IGeneratorConfig {
    const params: IGeneratorConfig = {
      config: '',
      out: '',
      ext: '',
      templateFolder: '',
      customMethodNameParser: '',
      readonlyModels: false,
      withoutModule: false,
      providedIn: 'root',
      help: false
    };
    const args = process.argv;
    for (let i = 0; i < args.length; i++) {
      for (const param of GeneratorParams) {
        if (param.keys.includes(args[i])) {
          if (param.noValue) {
            params[param.name] = true;
            break;
          } else {
            params[param.name] = args[i + 1];
            i++;
            break;
          }
        }
      }
    }
    return params;
  }
  public printHelp() {
    this.logger
      .fg('green')
      .writeln('')
      .write('[HELP]')
      .write(':')
      .writeln('')
      .reset()
      .writeln('');
    for (const key of GeneratorParams) {
      let line = `     ${key.name}          `;
      line = line.substr(0, 15);
      const args = new Array(40).fill(' ');
      let i = 1;
      for (const arg of key.keys) {
        args[i + 2] = arg;
        i = i + 2;
      }
      this.logger.write(line).fg('yellow');
      line = args.join('');
      line = line.substr(0, 20);
      this.logger.write(line).reset();
      line = '     ' + key.description;
      this.logger.write(line);
      this.logger.writeln('');
    }
  }
}
