import { injectAll, singleton } from 'tsyringe';

@singleton()
export class Logger {
  private colorsMap: Record<LoggerColorTypeSet, ILoggerColor>;
  constructor(@injectAll('LOGGER_COLORS') private colors: ILoggerColorToken[]) {
    this.colorsMap = this.colors.reduce((x, y) => {
      return {
        ...x,
        [y.type]: y.color,
      };
    }, {}) as Record<LoggerColorTypeSet, ILoggerColor>;
  }
  public reset(): Logger {
    process.stdout.write(this.colorsMap.Help.reset);
    return this;
  }
  public bg(color: string): Logger {
    process.stdout.write(this.colorsMap.Background[color]);
    return this;
  }
  public fg(color: string): Logger {
    process.stdout.write(this.colorsMap.Text[color]);
    return this;
  }
  public write(line: string): Logger {
    process.stdout.write(line);
    return this;
  }
  public writeln(line: string): Logger {
    process.stdout.write(line);
    process.stdout.write('\r\n');
    return this;
  }
  public info(message: string) {
    this.reset().writeln('').fg('blue').writeln(message).reset();
  }
  public err(message: string) {
    this.reset().writeln('').fg('red').writeln(message).reset();
  }
  public ok(message: string) {
    this.reset().writeln('').fg('green').writeln(message).reset();
  }
}
