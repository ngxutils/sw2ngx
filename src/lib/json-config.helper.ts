import * as fs from 'fs';

import { injectable } from 'tsyringe';

@injectable()
export class JsonConfigHelper{
  constructor() {
  }
  getConfig(path:string): Sw2NgxConfig {
    let config = {} as Sw2NgxConfig
    try{
      config = JSON.parse(fs.readFileSync(path).toString())
    } catch (e) {
      return { } as Sw2NgxConfig
    }
    return config
  }

}
