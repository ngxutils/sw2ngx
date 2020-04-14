
import { Parser } from "./utils/parser";
import { ISwaggerConfig } from "./interfaces/swagger.interface";
import { HelpCLI } from "./utils/helpcli";
import { IGeneratorConfig } from "./interfaces/config";
import * as fs from "fs";
import { Logger } from "./utils/logger";
import {
  IParserEnum,
  IParserModel,
  IParserServiceList
} from "./interfaces/parser";
import { TemplatePrinter } from "./utils/template-printer";
import fetch from "node-fetch";

export default class Generator {
  public config: IGeneratorConfig;
  public swagger: ISwaggerConfig | null = null;
  private parser: Parser = new Parser();
  private helper: HelpCLI = new HelpCLI();
  private _logger: Logger = new Logger();
  private _printer: TemplatePrinter = new TemplatePrinter();
  constructor(config: IGeneratorConfig | null = null) {
    if (config) {
      this.config = config;
    } else {
      this.config = this.helper.parseArgs();
    }

    if (this.config.help) {
      this.helper.printHelp();
    } else {
      if (this.config.config !== "" && this.config.out !== "") {
        this.start();
      } else {
        this._logger.err("Params not set, see help and try again:");
        this.helper.printHelp();
      }
    }
  }
  public start() {
    this.getConfig(this.config.config).then(
      res => {
        this._logger.info("<Parsing Processed...>");
        this._logger.ok(JSON.stringify(res));
        this.parser.parse(res).then(
          (res: [IParserEnum[], IParserModel[], IParserServiceList]) => {
            this._logger.ok("[ SUCCESS ]: Swagger JSON Parsed Successfull!");
            this._logger.info("<Files Saving>");
            let extend = null;
            try {
              extend = JSON.parse(
                fs.readFileSync("./sw2ngx-extend.json", "utf-8")
              );
            } catch (e) {
              this._logger.info("Not have extends");
            }
            if (extend) {
              if (extend.enums) {
                res[0].push(...extend.enums);
              }
              if (extend.models) {
                res[1].push(...extend.models);
              }
              if (extend.services) {
                for (const key in extend.services) {
                  if (extend.services[key]) {
                    if (res[2][key]) {
                      if (extend.services[key].imports) {
                        res[2][key].imports.push(
                          ...extend.services[key].imports
                        );
                      }
                      if (extend.services[key].methods) {
                        res[2][key].methods.push(
                          ...extend.services[key].methods
                        );
                      }
                    } else {
                      res[2][key] = extend.services[key];
                    }
                  }
                }
              }
            }
            // fs.writeFileSync(path.resolve('./result.json'), JSON.stringify({
            //     enums: res[0],
            //     models: res[1],
            //     services: res[2]
            // }));
            this._printer.print(res[0], res[1], res[2], this.config.out).then(
              () => {
                this._logger.ok(
                  "[ SUCCESS ]: Generation API Module Successfull!"
                );
              },
              reject => {
                console.log("end here");
                this._logger.err(JSON.stringify(reject));
              }
            );
          },
          err => {
            this._logger.err(JSON.stringify(err));
          }
        );
        // this._logger.info('<Create Swagger Map Object>');
      },
      err => {
        this._logger.err(JSON.stringify(err));
      }
    );
  }

  private getConfig(conf: string): Promise<any> {
    const promise = new Promise<any>((resolve, reject) => {
      if (/http(s?):\/\/\S/gi.test(conf)) {
        fetch(conf)
          .then((res: any)=>{
            resolve(res.json())
          })
          .catch((err: any)=>{
            this._logger.err(err);
            reject(err);
          });
      } else {
        this.swagger = JSON.parse(fs.readFileSync(conf, "utf-8"));
        resolve(this.swagger);
      }
    });

    return promise;
  }
}
