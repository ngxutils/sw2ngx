import fs from 'fs'

import fetch from 'node-fetch';
import { BehaviorSubject, Observable } from 'rxjs';
import { filter } from 'rxjs/operators';
import { singleton } from 'tsyringe';

@singleton()
export class SwaggerConfigLoader {
  loadConfig(configPath:string){
    if (/http(s?):\/\/\S/gi.test(configPath)) {
      return this.getByUrl(configPath)
    } else {
      return this.getByFilePath(configPath)
    }
  }

  private getByUrl(configPath: string): Observable<any> {
    const swaggerConfig = new BehaviorSubject(null)
    fetch(configPath)
      .catch((err)=>{
        swaggerConfig.error(`[ERROR]: loading swagger.json (Stack Trace: ) ${JSON.stringify(err)}`)
        return Promise.reject(err)
      })
      .then((res)=> res.json())
      .then((config)=>swaggerConfig.next(config))
      .catch((err)=>swaggerConfig.error(`[ERROR]: Parsing swagger json (Stack Trace: ) ${JSON.stringify(err)}`))
    return  swaggerConfig.pipe(filter(x=>!!x))
  }
  private getByFilePath(configPath: string) {
    const swaggerConfig  = new BehaviorSubject(null)
    try{
      const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      swaggerConfig.next(config)
    }
    catch (err){
      swaggerConfig.error(`[ERROR]: Load or parsing swagger config (Stack Trace: ) ${JSON.stringify(err)}`)
    }

    return swaggerConfig.pipe(filter((x)=>!!x))
  }
}
