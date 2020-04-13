export interface IColor {
    [key: string]: string;
}
export declare const COLORS_HLP: IColor;
export declare const COLORS_TXT: IColor;
export declare const COLORS_BG: IColor;
export declare class Logger {
    reset(): Logger;
    bg(color: string): Logger;
    fg(color: string): Logger;
    write(line: string): Logger;
    writeln(line: string): Logger;
    info(message: string): void;
    err(message: string): void;
    ok(message: string): void;
}
