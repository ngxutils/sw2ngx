"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ModelTemplate = /** @class */ (function () {
    function ModelTemplate() {
    }
    ModelTemplate.prototype.modelImports = function (modelImports, name) {
        var imports = [];
        if (modelImports.length === 0) {
            return '';
        }
        imports.push("import {");
        for (var _i = 0, modelImports_1 = modelImports; _i < modelImports_1.length; _i++) {
            var item = modelImports_1[_i];
            if (item !== name) {
                imports.push(item + ",");
            }
        }
        imports.push("} from './';");
        return imports.join('\r\n');
    };
    ModelTemplate.prototype.body = function (value) {
        var itemp = [];
        var temp = [];
        for (var _i = 0, value_1 = value; _i < value_1.length; _i++) {
            var param = value_1[_i];
            if (param.description) {
                itemp.push("/* " + param.description + " */");
            }
            itemp.push(param.name + " : " + param.type + ";");
            temp.push("public " + param.name + ": " + param.type + ";");
        }
        return {
            iprop: itemp.join('\r\n\t'),
            prop: temp.join('\r\n\t')
        };
    };
    ModelTemplate.prototype.compile = function (value) {
        var _a = this.body(value.props), iprop = _a.iprop, prop = _a.prop;
        return "\n" + this.modelImports(value.imports, value.name) + "\n\nexport interface I" + value.name + " {\n  " + iprop + "\n}\n\nexport class " + value.name + " implements I" + value.name + " {\n  " + prop + "\n}\n";
    };
    return ModelTemplate;
}());
exports.ModelTemplate = ModelTemplate;
//# sourceMappingURL=model.js.map