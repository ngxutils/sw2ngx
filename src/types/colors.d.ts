declare interface ILoggerColor {
  [key: string]: string;
}
declare type LoggerColorTypeSet = "Help" | "Text" | "Background"

declare interface ILoggerColorToken {
  type: LoggerColorTypeSet,
  color: ILoggerColor
}
