import path from 'path';
import { OpenApiV3Parser } from './openapi.parser';
import { OpenApiV2Parser } from './swagger.parser';
export const parserConfiguration = [
    {
        token: 'PARSER',
        useClass: OpenApiV2Parser,
    },
    {
        token: 'PARSER',
        useClass: OpenApiV3Parser,
    },
    {
        token: 'CLI_PARAM',
        useValue: {
            key: '-parser-custom-method-name',
            name: 'parserMethodName',
            description: 'file for parsing method name function',
            withoutValue: false,
            required: true,
            valueParser: (value) => {
                // eslint-disable-next-line @typescript-eslint/no-var-requires
                const { methodNameParser } = require(path.resolve(process.cwd(), value));
                return methodNameParser;
            },
            defaultValueFunction: () => {
                // eslint-disable-next-line @typescript-eslint/no-var-requires
                const { methodNameParser } = require(path.resolve(__dirname, `./parser-functions/method-name.js`));
                return methodNameParser;
            },
        },
    },
    {
        token: 'CLI_PARAM',
        useValue: {
            key: '-parser-custom-model-name',
            name: 'parserModelName',
            description: 'file for parsing model name function',
            withoutValue: false,
            required: true,
            valueParser: (value) => {
                // eslint-disable-next-line @typescript-eslint/no-var-requires
                const { modelNameParser } = require(path.resolve(process.cwd(), value));
                return modelNameParser;
            },
            defaultValueFunction: () => {
                // eslint-disable-next-line @typescript-eslint/no-var-requires
                const { modelNameParser } = require(path.resolve(__dirname, `./parser-functions/model-name.js`));
                return modelNameParser;
            },
        },
    },
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFyc2VyLmNvbmZpZ3VyYXRpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvbGliL3BhcnNlci9wYXJzZXIuY29uZmlndXJhdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLElBQUksTUFBTSxNQUFNLENBQUM7QUFFeEIsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLGtCQUFrQixDQUFDO0FBQ25ELE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSxrQkFBa0IsQ0FBQztBQUVuRCxNQUFNLENBQUMsTUFBTSxtQkFBbUIsR0FBRztJQUNqQztRQUNFLEtBQUssRUFBRSxRQUFRO1FBQ2YsUUFBUSxFQUFFLGVBQWU7S0FDMUI7SUFDRDtRQUNFLEtBQUssRUFBRSxRQUFRO1FBQ2YsUUFBUSxFQUFFLGVBQWU7S0FDMUI7SUFDRDtRQUNFLEtBQUssRUFBRSxXQUFXO1FBQ2xCLFFBQVEsRUFBRTtZQUNSLEdBQUcsRUFBRSw0QkFBNEI7WUFDakMsSUFBSSxFQUFFLGtCQUFrQjtZQUN4QixXQUFXLEVBQUUsdUNBQXVDO1lBQ3BELFlBQVksRUFBRSxLQUFLO1lBQ25CLFFBQVEsRUFBRSxJQUFJO1lBQ2QsV0FBVyxFQUFFLENBQUMsS0FBYSxFQUFFLEVBQUU7Z0JBQzdCLDhEQUE4RDtnQkFDOUQsTUFBTSxFQUFFLGdCQUFnQixFQUFFLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQy9DLE9BQU8sQ0FBQyxHQUFHLEVBQUUsRUFDYixLQUFLLENBQ04sQ0FBQyxDQUFDO2dCQUNILE9BQU8sZ0JBQWdCLENBQUM7WUFDMUIsQ0FBQztZQUNELG9CQUFvQixFQUFFLEdBQUcsRUFBRTtnQkFDekIsOERBQThEO2dCQUM5RCxNQUFNLEVBQUUsZ0JBQWdCLEVBQUUsR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FDL0MsU0FBUyxFQUNULG1DQUFtQyxDQUNwQyxDQUFDLENBQUM7Z0JBQ0gsT0FBTyxnQkFBZ0IsQ0FBQztZQUMxQixDQUFDO1NBQ0Y7S0FDRjtJQUNEO1FBQ0UsS0FBSyxFQUFFLFdBQVc7UUFDbEIsUUFBUSxFQUFFO1lBQ1IsR0FBRyxFQUFFLDJCQUEyQjtZQUNoQyxJQUFJLEVBQUUsaUJBQWlCO1lBQ3ZCLFdBQVcsRUFBRSxzQ0FBc0M7WUFDbkQsWUFBWSxFQUFFLEtBQUs7WUFDbkIsUUFBUSxFQUFFLElBQUk7WUFDZCxXQUFXLEVBQUUsQ0FBQyxLQUFhLEVBQUUsRUFBRTtnQkFDN0IsOERBQThEO2dCQUM5RCxNQUFNLEVBQUUsZUFBZSxFQUFFLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7Z0JBQ3hFLE9BQU8sZUFBZSxDQUFDO1lBQ3pCLENBQUM7WUFDRCxvQkFBb0IsRUFBRSxHQUFHLEVBQUU7Z0JBQ3pCLDhEQUE4RDtnQkFDOUQsTUFBTSxFQUFFLGVBQWUsRUFBRSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUM5QyxTQUFTLEVBQ1Qsa0NBQWtDLENBQ25DLENBQUMsQ0FBQztnQkFDSCxPQUFPLGVBQWUsQ0FBQztZQUN6QixDQUFDO1NBQ0Y7S0FDRjtDQUNGLENBQUMifQ==