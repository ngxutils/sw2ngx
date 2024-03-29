import { injectAll, singleton } from 'tsyringe';

@singleton()
export class Sw2NgxConfigNormalizer {
  constructor(@injectAll('CLI_PARAM') private params: CliParam[] = []) {}
  normalize(parsedParams: Sw2NgxConfig, needValidation = false): Sw2NgxConfig {
    let configurationIsValid = true;
    this.params?.forEach((param) => {
      if (param.valueParser && parsedParams[param.name]) {
        try {
          parsedParams[param.name] = param.valueParser(
            parsedParams[param.name]
          );
        } catch (e) {
          delete parsedParams[param.name];
        }
      }

      if (!parsedParams[param.name]) {
        if (param.defaultValueFunction || param.default) {
          if (param.defaultValueFunction) {
            parsedParams[param.name] = param.defaultValueFunction();
          } else {
            parsedParams[param.name] = param.default as string;
          }
        }
      }
      if (!parsedParams[param.name] && param.required) {
        configurationIsValid = false;
      }
    });
    if (needValidation) {
      return (
        configurationIsValid ? parsedParams : { parsingError: true }
      ) as Sw2NgxConfig;
    }
    return parsedParams;
  }
}
