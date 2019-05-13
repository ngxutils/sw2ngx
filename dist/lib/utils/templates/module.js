"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ModuleTemplate = /** @class */ (function () {
    function ModuleTemplate() {
    }
    ModuleTemplate.prototype.compile = function (value) {
        var servicesList = [];
        for (var _i = 0, value_1 = value; _i < value_1.length; _i++) {
            var el = value_1[_i];
            servicesList.push(el + "APIService,");
        }
        var importsHead = servicesList.join('\r\n\t');
        var importsBody = servicesList.join('\r\n\t\t\t\t');
        return "\nimport { NgModule, ModuleWithProviders } from '@angular/core';\nimport { HttpClientModule } from '@angular/common/http';\nimport {\n  " + importsHead + "\n} from './services';\n\n@NgModule({\n  imports: [\n    HttpClientModule\n  ],\n  exports: [],\n  declarations: [],\n  providers: [\n  ],\n})\nexport class APIModule {\n  public static forRoot(): ModuleWithProviders {\n    return {\n      ngModule: APIModule,\n      providers: [\n        " + importsBody + "\n      ],\n    };\n  }\n}\n";
    };
    return ModuleTemplate;
}());
exports.ModuleTemplate = ModuleTemplate;
//# sourceMappingURL=module.js.map