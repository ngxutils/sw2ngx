import * as fs from 'fs';
import * as path from 'path';
import * as process from 'process';

import { paramCase } from 'change-case';
import * as ejs from 'ejs';
import {
  combineLatest,
  Observable,
  of, throwError
} from 'rxjs';
import { fromArray } from 'rxjs/internal/observable/fromArray';
import {
  filter,
  map, mergeMap, reduce,
  switchMap, take, tap
} from 'rxjs/operators';
import { singleton } from 'tsyringe';

import { ConfigurationRepository } from '../configuration.repository';
import { Logger } from '../logger';


@singleton()
export class TemplatePrinterService {
  private get config(): Observable<Sw2NgxConfig>{
    if(this.sw2ngxConfiguration){
      return this.sw2ngxConfiguration.config.pipe(filter((x):x is Sw2NgxConfig=>!!x))
    }
    return of()
  }
  constructor(private logger?: Logger, private sw2ngxConfiguration?: ConfigurationRepository) {
  }
  print(apiDefinition: Sw2NgxApiDefinition): Observable<boolean>{
    this.logger?.info("Start Printing templates")

    return this.createGeneratorFolder(apiDefinition).pipe(
      filter((x): x is string=>!!x),
      switchMap((outPath)=> {
        return combineLatest([
          this.printModelsStream(
          apiDefinition.models,
          outPath,
          apiDefinition.enums.length>0,
          this.sw2ngxConfiguration?.config?.value?.readOnlyModels|| false),
            this.printEnumsStream(apiDefinition.enums, outPath),
            this.printServiceStream(apiDefinition.services)
        ])
      }),
      map((res)=>{ console.log(res)
      return true})
      )
  }
  private createGeneratorFolder(apiDefinition: Sw2NgxApiDefinition): Observable<string | boolean>{
   return this.config.pipe(map(config=> {
     console.log('getConfig')
      return path.resolve(process.cwd(), config.outputPath)
    }), map(outPath=>{
      console.log('createPath')
      try {
        if(!fs.existsSync(outPath)){
          fs.mkdirSync(outPath)
        }
        fs.chmodSync(outPath, 0o777)
        if(!fs.existsSync(path.resolve(outPath, 'services'))){
          fs.mkdirSync(path.resolve(outPath, 'services'))
        }
        fs.chmodSync(path.resolve(outPath, 'services'), 0o777)
        if(!fs.existsSync(path.resolve(outPath, 'models'))){
          fs.mkdirSync(path.resolve(outPath, 'models'));
        }
        fs.chmodSync(path.resolve(outPath, 'models'), 0o777)
        if(apiDefinition.enums.length>0){
          if(!fs.existsSync(path.resolve(outPath , 'models/enums'))){
            fs.mkdirSync(path.resolve(outPath , 'models/enums'));
          }
          fs.chmodSync(path.resolve(outPath, 'models/enums'), 0o777)
        }
        return outPath;
      } catch (error) {
        console.log('error',error)
        return false
      }
    }))
  }

  private printModelsStream(models: Sw2NgxModel[],out: string, hasEnums:boolean, readOnlyProperties: boolean): Observable<boolean>{
    const indexTemplate = [
      (hasEnums?"import * from './enums'": '')
      ,... models
        .map((model)=> model.name)
        .map((modelName)=>`import * from './${paramCase(modelName).replace(/^i-/gi, '')+'.model.ts'}';`)
    ].join('/r/n');

    return  this.getTemplate('model').pipe(
      switchMap((template)=>{
        const templatedModels: Array<[string, Sw2NgxModel]> = models.map((model)=>[template, model])
        return fromArray(templatedModels)
      }),
      mergeMap(([template, model]: [string, Sw2NgxModel])=>{
        return new Observable<[string, string]>((rendered$)=>{
          ejs.renderFile(template, {
            model: model,
            readOnly: readOnlyProperties
          },{}, (err: unknown| undefined, render: string)=>{
            if(err){
              rendered$.next([model.name, 'error'])
              rendered$.complete()
              return
            }
            rendered$.next([model.name, render])
            rendered$.complete()
          })
        })
      }),
      mergeMap(( [templateName, rendered]: [string, string])=>{
        return new Observable<[string, boolean]>((written$)=>{
          if(rendered!=='error'){
            fs.writeFile(path.resolve(out, 'models', paramCase(templateName).replace(/^i-/gi, '')+'.model.ts'), rendered, (err)=>{
              if(err){
                written$.next([templateName, false])
              }else{
                written$.next([templateName, true])
              }
              written$.complete()
            })

          }else{
            written$.next([templateName, false])
            written$.complete()
          }
        })
      }),
      tap(([modelName, isPrinted])=>{
        if(isPrinted){
          this.logger?.ok(`OK: ${modelName}`)
        }else{
          this.logger?.err(`ERROR: ${modelName} file write`)
        }
      }),
      take(models.length),
      reduce((acc: boolean, [, success]: [string, boolean])=> {
        return acc && success
      }, true),
      tap(()=>{
          fs.writeFile(path.resolve(out, 'models','index.ts'), indexTemplate, (err)=>{
            if(err){
              this.logger?.err('ERROR: write models index')
            }
          })
      })
    )
  }
  private printEnumsStream(enums: Sw2NgxEnum[], out: string): Observable<boolean>{
    if(enums.length>0){
      console.log()
      return this.getTemplate('enum').pipe(
        switchMap((template): Observable<[string, Sw2NgxEnum]> =>{
        const enumsTemplated: [string, Sw2NgxEnum][] = enums.filter((x)=>!x.isPremitive).map((value)=>[template,value])
          return fromArray(enumsTemplated)
      }),
        mergeMap(([template, value]: [string, Sw2NgxEnum])=>{
          return new Observable<[string, string]>((rendered$)=>{
            ejs.renderFile(template, {value: value}, (err, render)=>{
              if(err){
                rendered$.next([value.name, 'error'])
              }else{
                rendered$.next([value.name, render])
              }
              rendered$.complete()
            })
          })
        }),
        mergeMap(([enumName, rendered])=>{
          return new Observable<[string, boolean]>((written$)=>{
            if(rendered!=='error'){
              fs.writeFile(path.resolve(out, 'models/enums', paramCase(enumName)+'.enum.ts'), rendered, (err)=>{
                if(err){
                  written$.next([enumName, false])
                }else{
                  written$.next([enumName, true])
                }
                written$.complete()
              })
            }else{
              written$.next([enumName, false])
              written$.complete()
            }
          })
        }),
        tap(([modelName, isPrinted])=>{
          if(isPrinted){
            this.logger?.ok(`OK: ${modelName}`)
          }else{
            this.logger?.err(`ERROR: ${modelName} file write`)
          }
        }),
        take(enums.length),
        reduce((acc: boolean, [, success]: [string, boolean])=> {
          return acc && success
        }, true)
      )
    }
    return of(true)
  }
  private printServiceStream(services: Sw2NgxService[]): Observable<boolean>{
    console.log(!!services)
    return of(true)
  }

  private getTemplate(type: 'model'| 'service'| 'enum'| 'module'):Observable<string>{
    return this.config.pipe(switchMap((config)=>{
      const templatePath = path.resolve(process.cwd(), config.templates, `${type}.ejs`)
      console.log('templateFolder', templatePath)
      return fs.existsSync(templatePath)? of(templatePath) : throwError('ERROR: failed to get the template')
    }))

  }
}

