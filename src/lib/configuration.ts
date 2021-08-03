import path from 'path';

export const configuration = [

  {
    token: 'CLI_PARAM',
    useValue: {
      key: "-c",
      name: "config",
      description: "path to configuration swagger/openapi json file",
      withoutValue: false,
      required: true
    }
  },
  {
    token: 'CLI_PARAM',
    useValue: {
      key: "-o",
      name: "outputPath",
      description: "path to folder where create generated api files",
      withoutValue: false,
      required: false,
      default: './api'
    }
  },
  {
    token: 'CLI_PARAM',
    useValue: {
      key: "-baseHref",
      name: "baseHref",
      description: "override base href constant for api services",
      withoutValue: false,
      required: false,
      default: '/'
    }
  },
  {
    token: 'CLI_PARAM',
    useValue: {
      key: "-preset",
      name: "preset",
      description: "preset sw2ngx configuration",
      withoutValue: false,
      required: false,
      defaultValueFunction: ()=>{
        return path.resolve(process.cwd(), `./sw2ngx.config.json`)
      }
    }
  },
  {
    token: 'CLI_PARAM',
    useValue: {
      key: "-tmpl",
      name: "templates",
      description: "folder for templates default use /templates/default from library files",
      withoutValue: false,
      required: false,
      defaultValueFunction: ()=>{
        return path.resolve(__dirname, `../templates/default`)
      }
    }},
  {
    token: 'CLI_PARAM',
    useValue: {
      key: "-provide-in",
      name: "provideIn",
      description: "define default provideIn in services",
      withoutValue: false,
      required: false,
      default: 'root'
    }
  },
  {
    token: 'CLI_PARAM',
    useValue: {
      key: "-srv-interface",
      name: "genServiceInterfaces",
      description: "add interfaces to service generation",
      withoutValue: true,
      required: false,
      default: false
    }
  },
  {
    token: 'CLI_PARAM',
    useValue: {
      key: "-normalize-model-name",
      name: "noModule",
      description: "create api services without module file",
      withoutValue: true,
      required: false,
      default: true
    }
  },
  {
    token: 'CLI_PARAM',
    useValue: {
      key: "-readonly",
      name: "readOnlyModels",
      description: "make readonly properties in data models interfaces",
      withoutValue: true,
      required: false,
      default: true
    }
  },
  {
    token: 'CLI_PARAM',
    useValue: {
      key: "-ext",
      name: "extendConfigPath",
      description: "path to extend swagger definition only static json file",
      withoutValue: false,
      required: false,
      default: './sw2ngx.extend.json'
    }
  },

  {
    token: 'LOGGER_COLORS',
    useValue: {
      type: 'Help',
      color: {
        reset: '\x1b[0m',
        bright: '\x1b[1m',
        dim: '\x1b[2m',
        underscore: '\x1b[4m',
        blink: '\x1b[5m',
        reverse: '\x1b[7m',
        hidden: '\x1b[8m'
      }
    }
  },
  {
    token: 'LOGGER_COLORS',
    useValue: {
      type: 'Background',
      color: {
        black: '\x1b[40m',
        red: '\x1b[41m',
        green: '\x1b[42m',
        yellow: '\x1b[43m',
        blue: '\x1b[44m',
        magenta: '\x1b[45m',
        cyan: '\x1b[46m',
        white: '\x1b[47m'
      }
    }
  },
  {
    token: 'LOGGER_COLORS',
    useValue: {
      type: 'Text',
      color: {
        black: '\x1b[30m',
        red: '\x1b[31m',
        green: '\x1b[32m',
        yellow: '\x1b[33m',
        blue: '\x1b[34m',
        magenta: '\x1b[35m',
        cyan: '\x1b[36m',
        white: '\x1b[37m'
      }
    }
  }
]
