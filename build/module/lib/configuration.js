import path from 'path';
export const configuration = [
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
                return path.resolve(process.cwd(), `./sw2ngx.config.json`);
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
                return path.resolve(__dirname, `../../templates/default`);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlndXJhdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9saWIvY29uZmlndXJhdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLElBQUksTUFBTSxNQUFNLENBQUM7QUFFeEIsTUFBTSxDQUFDLE1BQU0sYUFBYSxHQUFHO0lBQzNCO1FBQ0UsS0FBSyxFQUFFLFdBQVc7UUFDbEIsUUFBUSxFQUFFO1lBQ1IsR0FBRyxFQUFFLElBQUk7WUFDVCxJQUFJLEVBQUUsUUFBUTtZQUNkLFdBQVcsRUFBRSxpREFBaUQ7WUFDOUQsWUFBWSxFQUFFLEtBQUs7WUFDbkIsUUFBUSxFQUFFLElBQUk7U0FDZjtLQUNGO0lBQ0Q7UUFDRSxLQUFLLEVBQUUsV0FBVztRQUNsQixRQUFRLEVBQUU7WUFDUixHQUFHLEVBQUUsSUFBSTtZQUNULElBQUksRUFBRSxZQUFZO1lBQ2xCLFdBQVcsRUFBRSxpREFBaUQ7WUFDOUQsWUFBWSxFQUFFLEtBQUs7WUFDbkIsUUFBUSxFQUFFLEtBQUs7WUFDZixPQUFPLEVBQUUsT0FBTztTQUNqQjtLQUNGO0lBQ0Q7UUFDRSxLQUFLLEVBQUUsV0FBVztRQUNsQixRQUFRLEVBQUU7WUFDUixHQUFHLEVBQUUsV0FBVztZQUNoQixJQUFJLEVBQUUsVUFBVTtZQUNoQixXQUFXLEVBQUUsOENBQThDO1lBQzNELFlBQVksRUFBRSxLQUFLO1lBQ25CLFFBQVEsRUFBRSxLQUFLO1lBQ2YsT0FBTyxFQUFFLEdBQUc7U0FDYjtLQUNGO0lBQ0Q7UUFDRSxLQUFLLEVBQUUsV0FBVztRQUNsQixRQUFRLEVBQUU7WUFDUixHQUFHLEVBQUUsU0FBUztZQUNkLElBQUksRUFBRSxRQUFRO1lBQ2QsV0FBVyxFQUFFLDZCQUE2QjtZQUMxQyxZQUFZLEVBQUUsS0FBSztZQUNuQixRQUFRLEVBQUUsS0FBSztZQUNmLG9CQUFvQixFQUFFLEdBQUcsRUFBRTtnQkFDekIsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFD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