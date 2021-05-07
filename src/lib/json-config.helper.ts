import * as fs from 'fs';

import { injectable } from 'tsyringe';

import { Sw2NgxConfigNormalizer } from './config-normalizer';

@injectable()
export class JsonConfigHelper{
  constructor(private configNormalize?: Sw2NgxConfigNormalizer) {
  }
  getConfig(path:string): Sw2NgxConfig {
    let config = {} as Sw2NgxConfig
    try{
      config = JSON.parse(fs.readFileSync(path).toString())
    } catch (e) {
      return { } as Sw2NgxConfig
    }
    return this.configNormalize?.normalize(config)|| {} as Sw2NgxConfig
  }

}
