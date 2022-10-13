"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Sw2NgxConfigNormalizer = void 0;
const tsyringe_1 = require("tsyringe");
let Sw2NgxConfigNormalizer = class Sw2NgxConfigNormalizer {
    constructor(params = []) {
        this.params = params;
    }
    normalize(parsedParams, needValidation = false) {
        var _a;
        let configurationIsValid = true;
        (_a = this.params) === null || _a === void 0 ? void 0 : _a.forEach((param) => {
            if (param.valueParser && parsedParams[param.name]) {
                try {
                    parsedParams[param.name] = param.valueParser(parsedParams[param.name]);
                }
                catch (e) {
                    delete parsedParams[param.name];
                }
            }
            if (!parsedParams[param.name]) {
                if (param.defaultValueFunction || param.default) {
                    if (param.defaultValueFunction) {
                        parsedParams[param.name] = param.defaultValueFunction();
                    }
                    else {
                        parsedParams[param.name] = param.default;
                    }
                }
            }
            if (!parsedParams[param.name] && param.required) {
                configurationIsValid = false;
            }
        });
        if (needValidation) {
            return (configurationIsValid ? parsedParams : { parsingError: true });
        }
        return parsedParams;
    }
};
Sw2NgxConfigNormalizer = __decorate([
    tsyringe_1.singleton(),
    __param(0, tsyringe_1.injectAll('CLI_PARAM')),
    __metadata("design:paramtypes", [Array])
], Sw2NgxConfigNormalizer);
exports.Sw2NgxConfigNormalizer = Sw2NgxConfigNormalizer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlnLW5vcm1hbGl6ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbGliL2NvbmZpZy1ub3JtYWxpemVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztBQUFBLHVDQUFnRDtBQUdoRCxJQUFhLHNCQUFzQixHQUFuQyxNQUFhLHNCQUFzQjtJQUNqQyxZQUE0QyxTQUFxQixFQUFFO1FBQXZCLFdBQU0sR0FBTixNQUFNLENBQWlCO0lBQUcsQ0FBQztJQUN2RSxTQUFTLENBQUMsWUFBMEIsRUFBRSxjQUFjLEdBQUcsS0FBSzs7UUFDMUQsSUFBSSxvQkFBb0IsR0FBRyxJQUFJLENBQUM7UUFDaEMsTUFBQSxJQUFJLENBQUMsTUFBTSwwQ0FBRSxPQUFPLENBQUMsQ0FBQyxLQUFLLEVBQUUsRUFBRTtZQUM3QixJQUFJLEtBQUssQ0FBQyxXQUFXLElBQUksWUFBWSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsRUFBRTtnQkFDakQsSUFBSTtvQkFDRixZQUFZLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLEtBQUssQ0FBQyxXQUFXLENBQzFDLFlBQVksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQ3pCLENBQUM7aUJBQ0g7Z0JBQUMsT0FBTyxDQUFDLEVBQUU7b0JBQ1YsT0FBTyxZQUFZLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO2lCQUNqQzthQUNGO1lBRUQsSUFBSSxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEVBQUU7Z0JBQzdCLElBQUksS0FBSyxDQUFDLG9CQUFvQixJQUFJLEtBQUssQ0FBQyxPQUFPLEVBQUU7b0JBQy9DLElBQUksS0FBSyxDQUFDLG9CQUFvQixFQUFFO3dCQUM5QixZQUFZLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLEtBQUssQ0FBQyxvQkFBb0IsRUFBRSxDQUFDO3FCQUN6RDt5QkFBTTt3QkFDTCxZQUFZLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLEtBQUssQ0FBQyxPQUFpQixDQUFDO3FCQUNwRDtpQkFDRjthQUNGO1lBQ0QsSUFBSSxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksS0FBSyxDQUFDLFFBQVEsRUFBRTtnQkFDL0Msb0JBQW9CLEdBQUcsS0FBSyxDQUFDO2FBQzlCO1FBQ0gsQ0FBQyxDQUFDLENBQUM7UUFDSCxJQUFJLGNBQWMsRUFBRTtZQUNsQixPQUFPLENBQ0wsb0JBQW9CLENBQUMsQ0FBQyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsRUFBRSxZQUFZLEVBQUUsSUFBSSxFQUFFLENBQzdDLENBQUM7U0FDbkI7UUFDRCxPQUFPLFlBQVksQ0FBQztJQUN0QixDQUFDO0NBQ0YsQ0FBQTtBQW5DWSxzQkFBc0I7SUFEbEMsb0JBQVMsRUFBRTtJQUVHLFdBQUEsb0JBQVMsQ0FBQyxXQUFXLENBQUMsQ0FBQTs7R0FEeEIsc0JBQXNCLENBbUNsQztBQW5DWSx3REFBc0IifQ==