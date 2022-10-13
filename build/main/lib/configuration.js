"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.configuration = void 0;
const path_1 = __importDefault(require("path"));
exports.configuration = [
    {
        token: 'CLI_PARAM',
        useValue: {
            key: '-c',
            name: 'config',
            description: 'path to configuration swagger/openapi json file',
            withoutValue: false,
            required: true,
        },
    },
    {
        token: 'CLI_PARAM',
        useValue: {
            key: '-o',
            name: 'outputPath',
            description: 'path to folder where create generated api files',
            withoutValue: false,
            required: false,
            default: './api',
        },
    },
    {
        token: 'CLI_PARAM',
        useValue: {
            key: '-baseHref',
            name: 'baseHref',
            description: 'override base href constant for api services',
            withoutValue: false,
            required: false,
            default: '/',
        },
    },
    {
        token: 'CLI_PARAM',
        useValue: {
            key: '-preset',
            name: 'preset',
            description: 'preset sw2ngx configuration',
            withoutValue: false,
            required: false,
            defaultValueFunction: () => {
                return path_1.default.resolve(process.cwd(), `./sw2ngx.config.json`);
            },
        },
    },
    {
        token: 'CLI_PARAM',
        useValue: {
            key: '-tmpl',
            name: 'templates',
            description: 'folder for templates default use /templates/default from library files',
            withoutValue: false,
            required: false,
            defaultValueFunction: () => {
                return path_1.default.resolve(__dirname, `../../templates/default`);
            },
        },
    },
    {
        token: 'CLI_PARAM',
        useValue: {
            key: '-provide-in',
            name: 'provideIn',
            description: 'define default provideIn in services',
            withoutValue: false,
            required: false,
            default: 'root',
        },
    },
    {
        token: 'CLI_PARAM',
        useValue: {
            key: '-srv-interface',
            name: 'genServiceInterfaces',
            description: 'add interfaces to service generation',
            withoutValue: true,
            required: false,
            default: false,
        },
    },
    {
        token: 'CLI_PARAM',
        useValue: {
            key: '-readonly',
            name: 'readOnlyModels',
            description: 'make readonly properties in data models interfaces',
            withoutValue: true,
            required: false,
            default: true,
        },
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
                hidden: '\x1b[8m',
            },
        },
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
                white: '\x1b[47m',
            },
        },
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
                white: '\x1b[37m',
            },
        },
    },
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlndXJhdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9saWIvY29uZmlndXJhdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSxnREFBd0I7QUFFWCxRQUFBLGFBQWEsR0FBRztJQUMzQjtRQUNFLEtBQUssRUFBRSxXQUFXO1FBQ2xCLFFBQVEsRUFBRTtZQUNSLEdBQUcsRUFBRSxJQUFJO1lBQ1QsSUFBSSxFQUFFLFFBQVE7WUFDZCxXQUFXLEVBQUUsaURBQWlEO1lBQzlELFlBQVksRUFBRSxLQUFLO1lBQ25CLFFBQVEsRUFBRSxJQUFJO1NBQ2Y7S0FDRjtJQUNEO1FBQ0UsS0FBSyxFQUFFLFdBQVc7UUFDbEIsUUFBUSxFQUFFO1lBQ1IsR0FBRyxFQUFFLElBQUk7WUFDVCxJQUFJLEVBQUUsWUFBWTtZQUNsQixXQUFXLEVBQUUsaURBQWlEO1lBQzlELFlBQVksRUFBRSxLQUFLO1lBQ25CLFFBQVEsRUFBRSxLQUFLO1lBQ2YsT0FBTyxFQUFFLE9BQU87U0FDakI7S0FDRjtJQUNEO1FBQ0UsS0FBSyxFQUFFLFdBQVc7UUFDbEIsUUFBUSxFQUFFO1lBQ1IsR0FBRyxFQUFFLFdBQVc7WUFDaEIsSUFBSSxFQUFFLFVBQVU7WUFDaEIsV0FBVyxFQUFFLDhDQUE4QztZQUMzRCxZQUFZLEVBQUUsS0FBSztZQUNuQixRQUFRLEVBQUUsS0FBSztZQUNmLE9BQU8sRUFBRSxHQUFHO1NBQ2I7S0FDRjtJQUNEO1FBQ0UsS0FBSyxFQUFFLFdBQVc7UUFDbEIsUUFBUSxFQUFFO1lBQ1IsR0FBRyxFQUFFLFNBQVM7WUFDZCxJQUFJLEVBQUUsUUFBUTtZQUNkLFdBQVcsRUFBRSw2QkFBNkI7WUFDMUMsWUFBWSxFQUFFLEtBQUs7WUFDbkIsUUFBUSxFQUFFLEtBQUs7WUFDZixvQkFBb0IsRUFBRSxHQUFHLEVBQUU7Z0JBQ3pCLE9BQU8sY0FBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFLEVB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