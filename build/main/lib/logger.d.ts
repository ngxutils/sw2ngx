export declare class Logger {
    private colors;
    private colorsMap;
    constructor(colors: ILoggerColorToken[]);
    reset(): Logger;
    bg(color: string): Logger;
    fg(color: string): Logger;
    write(line: string): Logger;
    writeln(line: string): Logger;
    info(message: string): void;
    err(message: string): void;
    ok(message: string): void;
}
