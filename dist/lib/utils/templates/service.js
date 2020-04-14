"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ServiceTemplate = /** @class */ (function () {
    function ServiceTemplate() {
    }
    ServiceTemplate.prototype.imports = function (imp) {
        var imports = [];
        if (imp.length === 0) {
            return '';
        }
        imports.push("import {");
        for (var _i = 0, imp_1 = imp; _i < imp_1.length; _i++) {
            var item = imp_1[_i];
            imports.push(item + ",");
        }
        imports.push("} from '../models';");
        return imports.join('\r\n');
    };
    ServiceTemplate.prototype.methodDescription = function (method) {
        var temp = [];
        temp.push("\n    /**\n     * @method\n     * @name  " + method.name + "\n     * @description" + (method.description ? method.description.replace('\r\n', '') : '') + "\r\n");
        for (var _i = 0, _a = method.params.all; _i < _a.length; _i++) {
            var param = _a[_i];
            temp.push("     * @param {" + param.type.typeName + "} " + param.name + "\r\n");
        }
        temp.push("     */");
        return temp.join('');
    };
    ServiceTemplate.prototype.methodParams = function (method, isInterface) {
        var temp = [];
        for (var _i = 0, _a = method.params.all; _i < _a.length; _i++) {
            var param = _a[_i];
            if (!isInterface) {
                if (param.default) {
                    temp.push(param.name + ": " + param.type.typeName + " = '" + param.default + "'");
                }
                else {
                    temp.push(param.name + ": " + param.type.typeName + (param.required ? '' : ' = null'));
                }
            }
            else {
                temp.push("" + param.name + (param.required ? '' : '?') + ": " + param.type.typeName);
            }
        }
        return temp.join(', ');
    };
    ServiceTemplate.prototype.methodBody = function (method) {
        var temp = [];
        if (method.params.query.length > 0) {
            temp.push("\n        let paramString = '';");
            var isFirst = true;
            for (var _i = 0, _a = method.params.query; _i < _a.length; _i++) {
                var param = _a[_i];
                temp.push("\n        if ((" + param.name + " !== undefined) && (" + param.name + " !== null)) {\n            paramString += '" + (isFirst ? '' : '&') + param.queryName + "=' + encodeURIComponent(" + param.name + (param.type.typeName === 'Date' ? '.toISOString()' : '.toString()') + ");\n        }" + (param.required ? " else { throw new Error('Required param(" + param.name + ") not set!'); }" : ''));
                isFirst = false;
            }
            temp.push("\n        options.params = new HttpParams({fromString: paramString});");
        }
        if ((method.type === 'post') || (method.type === 'put')) {
            if (method.params.form.length !== 0) {
                temp.push("\n        options.headers = new HttpHeaders();\n        options.headers.delete('Content-Type');\n        const form = new FormData();");
                for (var _b = 0, _c = method.params.form; _b < _c.length; _b++) {
                    var param = _c[_b];
                    if (param.type.typeName === 'any') {
                        temp.push("\n        form.append('" + param.queryName + "', " + param.name + ");");
                    }
                    else {
                        temp.push("\n        form.append('" + param.queryName + "', JSON.stringify(" + param.name + "));");
                    }
                }
                temp.push("\n        return this.http." + method.type + "<" + method.resp[0].typeName + ">(this.uri + `" + method.uri + "`, form, options);");
            }
            else {
                if (method.params.urlencoded.length !== 0) {
                    temp.push("\n        let payload = '';\n        options.headers = new HttpHeaders({'Content-Type': 'application/x-www-form-urlencoded'});");
                    var isFirst = true;
                    for (var _d = 0, _e = method.params.urlencoded; _d < _e.length; _d++) {
                        var param = _e[_d];
                        temp.push("\n        if ((" + param.name + " !== undefined) && (" + param.name + " !== null)) {\n            payload += '" + (isFirst ? '' : '&') + param.queryName + "=' + encodeURIComponent(" + param.name + (param.type.typeName === 'Date' ? '.toISOString()' : '.toString()') + ");\n        }" + (param.required ? " else { throw new Error('Required param(" + param.name + ") not set!'); }" : ''));
                        isFirst = false;
                    }
                    temp.push("\n        return this.http." + method.type + "<" + method.resp[0].typeName + ">(this.uri + `" + method.uri + "`, payload, options);");
                }
                else {
                    temp.push("\n        // tslint:disable-next-line:prefer-const\n        let payload = {};\n        options.headers = new HttpHeaders({'Content-Type': 'application/json; charset=utf-8'});");
                    if (method.params.payload.length > 1) {
                        for (var _f = 0, _g = method.params.payload; _f < _g.length; _f++) {
                            var param = _g[_f];
                            temp.push("\n        payload['" + param.queryName + "'] = " + param.name + ";");
                        }
                    }
                    else {
                        if (method.params.payload.length > 0) {
                            temp.push("\n        payload = " + method.params.payload[0].name + ";");
                        }
                    }
                    temp.push("\n        return this.http." + method.type + "<" + method.resp[0].typeName + ">(this.uri + `" + method.uri + "`, JSON.stringify(payload), options);");
                }
            }
        }
        if ((method.type === 'get') || (method.type === 'delete')) {
            temp.push("\n        return this.http." + method.type + "<" + method.resp[0].typeName + ">(this.uri + `" + method.uri + "`" + (method.params.query.length !== 0 ? ', options' : '') + ");");
        }
        return temp.join('\r\n');
    };
    ServiceTemplate.prototype.body = function (methods) {
        var interBody = [];
        var serviceBody = [];
        for (var _i = 0, methods_1 = methods; _i < methods_1.length; _i++) {
            var method = methods_1[_i];
            interBody.push(this.methodDescription(method) + "\n    " + method.name + "(" + this.methodParams(method, true) + "): Observable<" + method.resp[0].typeName + ">;");
            serviceBody.push("\tpublic " + method.name + "(" + this.methodParams(method, false) + "): Observable<" + method.resp[0].typeName + "> {\n        const options = {\n            headers: new HttpHeaders(),\n            params: new HttpParams()\n        };\n" + this.methodBody(method) + "\n    }");
        }
        return { interfaceBody: interBody.join('\r\n'), serviceBody: serviceBody.join('\r\n') };
    };
    ServiceTemplate.prototype.compile = function (value, name) {
        if (value.methods.length > 0) {
            var imports = this.imports(value.imports);
            var _a = this.body(value.methods), interfaceBody = _a.interfaceBody, serviceBody = _a.serviceBody;
            return "import { Injectable } from '@angular/core';\nimport { Subject, Observable } from 'rxjs';\nimport { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';\n" + imports + "\nexport interface I" + name + "APIService {\n" + interfaceBody + "\n}\n\n@Injectable({ providedIn:'root' })\nexport class " + name + "APIService implements I" + name + "APIService {\n  public serviceName: string;\n  public uri: string;\n  constructor(\n    public http: HttpClient) {\n    this.serviceName = '" + name + "API';\n    this.uri = '" + value.uri + "';\n  }\n" + serviceBody + "\n}\r\n";
        }
        else {
            return '';
        }
    };
    return ServiceTemplate;
}());
exports.ServiceTemplate = ServiceTemplate;
//# sourceMappingURL=service.js.map