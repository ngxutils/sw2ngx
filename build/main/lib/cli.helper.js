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
exports.CliHelper = void 0;
const tsyringe_1 = require("tsyringe");
const logger_1 = require("./logger");
let CliHelper = class CliHelper {
    constructor(params = [], logger) {
        this.params = params;
        this.logger = logger;
    }
    readCliParams() {
        return this.getCliParams();
    }
    printHelp() {
        var _a, _b, _c, _d, _e;
        for (const param of this.params) {
            let line = `${param.name}               `;
            line = line.substr(0, 18);
            const args = new Array(60).fill(' ');
            let i = 1;
            for (const arg of [param.key]) {
                args[i + 2] = arg;
                i = i + 2;
            }
            (_a = this.logger) === null || _a === void 0 ? void 0 : _a.write(line).fg('yellow');
            line = args.join('');
            line = line.substr(0, 30);
            (_b = this.logger) === null || _b === void 0 ? void 0 : _b.write(line).reset();
            line = '     ' + param.description;
            (_c = this.logger) === null || _c === void 0 ? void 0 : _c.write(line);
            (_d = this.logger) === null || _d === void 0 ? void 0 : _d.writeln('');
        }
        (_e = this.logger) === null || _e === void 0 ? void 0 : _e.writeln('').writeln('').reset();
    }
    getCliParams() {
        /** get all args from command line **/
        const args = process.argv;
        /**
         * create param map like:
         * {
         *   '-h': ICliParam
         * }
         * **/
        const paramsParserMap = (this.params || []).reduce((prev, cur) => {
            return Object.assign(Object.assign({}, prev), { [cur.key]: cur });
        }, {});
        /**
         * map cli args to Sw2NgxConfig
         * map may be not correct, need validation before use param
         * **/
        return args.reduce((prev, cur, index) => {
            const mappedConfigurationParam = paramsParserMap[cur];
            const mappedConfigurationParamValue = (mappedConfigurationParam === null || mappedConfigurationParam === void 0 ? void 0 : mappedConfigurationParam.withoutValue) ? true : args[index + 1];
            if (mappedConfigurationParam && mappedConfigurationParamValue) {
                return Object.assign(Object.assign({}, prev), { [mappedConfigurationParam.name]: mappedConfigurationParamValue });
            }
            return prev;
        }, {});
    }
};
CliHelper = __decorate([
    tsyringe_1.injectable(),
    tsyringe_1.registry([
        {
            token: 'CLI_PARAM',
            useValue: {
                key: '-h',
                name: 'help',
                description: 'show all commands and params',
                withoutValue: true,
                required: false,
                default: false,
            },
        },
    ]),
    __param(0, tsyringe_1.injectAll('CLI_PARAM')),
    __metadata("design:paramtypes", [Array, logger_1.Logger])
], CliHelper);
exports.CliHelper = CliHelper;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmhlbHBlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9saWIvY2xpLmhlbHBlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7QUFBQSx1Q0FBMkQ7QUFFM0QscUNBQWtDO0FBZ0JsQyxJQUFhLFNBQVMsR0FBdEIsTUFBYSxTQUFTO0lBQ3BCLFlBQ2tDLFNBQXFCLEVBQUUsRUFDL0MsTUFBZTtRQURTLFdBQU0sR0FBTixNQUFNLENBQWlCO1FBQy9DLFdBQU0sR0FBTixNQUFNLENBQVM7SUFDdEIsQ0FBQztJQUNHLGFBQWE7UUFDbEIsT0FBTyxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7SUFDN0IsQ0FBQztJQUNNLFNBQVM7O1FBQ2QsS0FBSyxNQUFNLEtBQUssSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFO1lBQy9CLElBQUksSUFBSSxHQUFHLEdBQUcsS0FBSyxDQUFDLElBQUksaUJBQWlCLENBQUM7WUFDMUMsSUFBSSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQzFCLE1BQU0sSUFBSSxHQUFHLElBQUksS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUNyQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDVixLQUFLLE1BQU0sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFO2dCQUM3QixJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQztnQkFDbEIsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7YUFDWDtZQUNELE1BQUEsSUFBSSxDQUFDLE1BQU0sMENBQUUsS0FBSyxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDdEMsSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDckIsSUFBSSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQzFCLE1BQUEsSUFBSSxDQUFDLE1BQU0sMENBQUUsS0FBSyxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsQ0FBQztZQUNqQyxJQUFJLEdBQUcsT0FBTyxHQUFHLEtBQUssQ0FBQyxXQUFXLENBQUM7WUFDbkMsTUFBQSxJQUFJLENBQUMsTUFBTSwwQ0FBRSxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDekIsTUFBQSxJQUFJLENBQUMsTUFBTSwwQ0FBRSxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUM7U0FDMUI7UUFDRCxNQUFBLElBQUksQ0FBQyxNQUFNLDBDQUFFLE9BQU8sQ0FBQyxFQUFFLEVBQUUsT0FBTyxDQUFDLEVBQUUsRUFBRSxLQUFLLEVBQUUsQ0FBQztJQUMvQyxDQUFDO0lBRUQsWUFBWTtRQUNWLHNDQUFzQztRQUN0QyxNQUFNLElBQUksR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDO1FBQzFCOzs7OztjQUtNO1FBQ04sTUFBTSxlQUFlLEdBQTZCLENBQ2hELElBQUksQ0FBQyxNQUFNLElBQUksRUFBRSxDQUNsQixDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksRUFBRSxHQUFHLEVBQUUsRUFBRTtZQUNyQix1Q0FDSyxJQUFJLEtBQ1AsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxJQUNkO1FBQ0osQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBRVA7OztjQUdNO1FBQ04sT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBa0IsRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLEVBQUU7WUFDcEQsTUFBTSx3QkFBd0IsR0FDNUIsZUFBZSxDQUFDLEdBQW1DLENBQUMsQ0FBQztZQUN2RCxNQUFNLDZCQUE2QixHQUNqQyxDQUFBLHdCQUF3QixhQUF4Qix3QkFBd0IsdUJBQXhCLHdCQUF3QixDQUFFLFlBQVksRUFBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQ2xFLElBQUksd0JBQXdCLElBQUksNkJBQTZCLEVBQUU7Z0JBQzdELHVDQUNLLElBQUksS0FDUCxDQUFDLHdCQUF3QixDQUFDLElBQUksQ0FBQyxFQUFFLDZCQUE2QixJQUM5RDthQUNIO1lBQ0QsT0FBTyxJQUFJLENBQUM7UUFDZCxDQUFDLEVBQUUsRUFBa0IsQ0FBQyxDQUFDO0lBQ3pCLENBQUM7Q0FDRixDQUFBO0FBakVZLFNBQVM7SUFkckIscUJBQVUsRUFBRTtJQUNaLG1CQUFRLENBQUM7UUFDUjtZQUNFLEtBQUssRUFBRSxXQUFXO1lBQ2xCLFFBQVEsRUFBRTtnQkFDUixHQUFHLEVBQUUsSUFBSTtnQkFDVCxJQUFJLEVBQUUsTUFBTTtnQkFDWixXQUFXLEVBQUUsOEJBQThCO2dCQUMzQyxZQUFZLEVBQUUsSUFBSTtnQkFDbEIsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsT0FBTyxFQUFFLEtBQUs7YUFDZjtTQUNGO0tBQ0YsQ0FBQztJQUdHLFdBQUEsb0JBQVMsQ0FBQyxXQUFXLENBQUMsQ0FBQTs0Q0FDTixlQUFNO0dBSGQsU0FBUyxDQWlFckI7QUFqRVksOEJBQVMifQ==