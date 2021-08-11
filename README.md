[![CI](https://github.com/ngxutils/sw2ngx/workflows/CI/badge.svg?branch=master)](https://github.com/ngxutils/sw2ngx/actions?query=workflow%3ACI)
[![npm](https://img.shields.io/npm/v/sw2ngx)](https://www.npmjs.com/package/sw2ngx)
[![npm](https://img.shields.io/npm/dm/sw2ngx)](https://www.npmjs.com/package/sw2ngx)

# SW2NGX - Swagger to Angular

![sw2ngx logo](https://raw.githubusercontent.com/ngxutils/sw2ngx/master/sw2ngx.png)

Generate Angular API services from swagger.json or openapi.json

# 💥 ATTENTION 💥: in version 6 and later breaking changes

if your project only uses swagger (openapi v2.x), use version no higher than 5.2.0

```bash
    // for example
    npx sw2ngx@5.2.0 -c https://petstore.swagger.io/v2/swagger.json -o ./path/to/api/module/folder
```

## 1. no need to install, just use!

```bash
    // use preset
    npx sw2ngx@latest -preset ./path/to/sw2ngx.json
    
    // use cli params
    npx sw2ngx@latest -preset ./path/to/sw2ngx.json
```

## 2. preset [schema](https://raw.githubusercontent.com/ngxutils/sw2ngx/master/config.scheme.json)

|cli key| property  | required  | default | description  |
|-------|-----------|-----------|---------|--------------|
|  -c   |     **config**      |      ✅     |    ❌     |  path to configuration swagger/openapi json file            |
|  -o   | **outputPath**  | ❎  | ./api  | path to folder where create generated api files  |
|  -baseHref |  **baseHref** | ❎  |  / | override base href constant for api services  |
|  -preset |  **preset** | ❎  |  / | override base href constant for api services  |
|  -tmpl |  **templates** | ❎  |  / |folder for templates default use /templates/default from library files  |
|  -provide-in |  **provideIn** | ❎  |  'root' | define default provideIn in services  |
|  -srv-interface |  **baseHref** | ❎  |  false  | add interfaces to service generation  |
|  -parser-custom-method-name |  **parserMethodName** | ❎  |  defaultMethodNameParser | file for parsing method name function  |
|  -parser-custom-model-name |  **parserModelName** | ❎  |  defaultModelNameParser | file for parsing model name function  |

## 3. customization
