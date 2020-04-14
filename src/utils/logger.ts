export interface IColor {
  [key: string]: string;
}
export const COLORS_HLP = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  underscore: '\x1b[4m',
  blink: '\x1b[5m',
  reverse: '\x1b[7m',
  hidden: '\x1b[8m'
} as IColor;

export const COLORS_TXT = {
  black: '\x1b[30m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
} as IColor;

export const COLORS_BG = {
  black: '\x1b[40m',
  red: '\x1b[41m',
  green: '\x1b[42m',
  yellow: '\x1b[43m',
  blue: '\x1b[44m',
  magenta: '\x1b[45m',
  cyan: '\x1b[46m',
  white: '\x1b[47m'
} as IColor;

export class Logger {
  public reset(): Logger {
    process.stdout.write(COLORS_HLP.reset);
    return this;
  }
  public bg(color: string): Logger {
    process.stdout.write(COLORS_BG[color]);
    return this;
  }
  public fg(color: string): Logger {
    process.stdout.write(COLORS_TXT[color]);
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
