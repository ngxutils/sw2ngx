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
import { injectable, injectAll, registry } from 'tsyringe';
import { Logger } from './logger';
let CliHelper = class CliHelper {
    params;
    logger;
    constructor(params = [], logger) {
        this.params = params;
        this.logger = logger;
    }
    readCliParams() {
        return this.getCliParams();
    }
    printHelp() {
        for (const param of this.params) {
            let line = `${param.name}               `;
            line = line.substr(0, 18);
            const args = new Array(60).fill(' ');
            let i = 1;
            for (const arg of [param.key]) {
                args[i + 2] = arg;
                i = i + 2;
            }
            this.logger?.write(line).fg('yellow');
            line = args.join('');
            line = line.substr(0, 30);
            this.logger?.write(line).reset();
            line = '     ' + param.description;
            this.logger?.write(line);
            this.logger?.writeln('');
        }
        this.logger?.writeln('').writeln('').reset();
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
            return {
                ...prev,
                [cur.key]: cur,
            };
        }, {});
        /**
         * map cli args to Sw2NgxConfig
         * map may be not correct, need validation before use param
         * **/
        return args.reduce((prev, cur, index) => {
            const mappedConfigurationParam = paramsParserMap[cur];
            const mappedConfigurationParamValue = mappedConfigurationParam?.withoutValue ? true : args[index + 1];
            if (mappedConfigurationParam && mappedConfigurationParamValue) {
                return {
                    ...prev,
                    [mappedConfigurationParam.name]: mappedConfigurationParamValue,
                };
            }
            return prev;
        }, {});
    }
};
CliHelper = __decorate([
    injectable(),
    registry([
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
    __param(0, injectAll('CLI_PARAM')),
    __metadata("design:paramtypes", [Array, Logger])
], CliHelper);
export { CliHelper };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmhlbHBlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9saWIvY2xpLmhlbHBlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFFLFNBQVMsRUFBRSxRQUFRLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFFM0QsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLFVBQVUsQ0FBQztBQWdCbEMsSUFBYSxTQUFTLEdBQXRCLE1BQWEsU0FBUztJQUVjO0lBQ3hCO0lBRlYsWUFDa0MsU0FBcUIsRUFBRSxFQUMvQyxNQUFlO1FBRFMsV0FBTSxHQUFOLE1BQU0sQ0FBaUI7UUFDL0MsV0FBTSxHQUFOLE1BQU0sQ0FBUztJQUN0QixDQUFDO0lBQ0csYUFBYTtRQUNsQixPQUFPLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQztJQUM3QixDQUFDO0lBQ00sU0FBUztRQUNkLEtBQUssTUFBTSxLQUFLLElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRTtZQUMvQixJQUFJLElBQUksR0FBRyxHQUFHLEtBQUssQ0FBQyxJQUFJLGlCQUFpQixDQUFDO1lBQzFDLElBQUksR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztZQUMxQixNQUFNLElBQUksR0FBRyxJQUFJLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDckMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ1YsS0FBSyxNQUFNLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRTtnQkFDN0IsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUM7Z0JBQ2xCLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2FBQ1g7WUFDRCxJQUFJLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxJQUFJLENBQUMs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