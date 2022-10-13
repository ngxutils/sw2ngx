"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parserConfiguration = void 0;
const path_1 = __importDefault(require("path"));
const openapi_parser_1 = require("./openapi.parser");
const swagger_parser_1 = require("./swagger.parser");
exports.parserConfiguration = [
    {
        token: 'PARSER',
        useClass: swagger_parser_1.OpenApiV2Parser,
    },
    {
        token: 'PARSER',
        useClass: openapi_parser_1.OpenApiV3Parser,
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
                const { methodNameParser } = require(path_1.default.resolve(process.cwd(), value));
                return methodNameParser;
            },
            defaultValueFunction: () => {
                // eslint-disable-next-line @typescript-eslint/no-var-requires
                const { methodNameParser } = require(path_1.default.resolve(__dirname, `./parser-functions/method-name.js`));
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
                const { modelNameParser } = require(path_1.default.resolve(process.cwd(), value));
                return modelNameParser;
            },
            defaultValueFunction: () => {
                // eslint-disable-next-line @typescript-eslint/no-var-requires
                const { modelNameParser } = require(path_1.default.resolve(__dirname, `./parser-functions/model-name.js`));
                return modelNameParser;
            },
        },
    },
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFyc2VyLmNvbmZpZ3VyYXRpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvbGliL3BhcnNlci9wYXJzZXIuY29uZmlndXJhdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSxnREFBd0I7QUFFeEIscURBQW1EO0FBQ25ELHFEQUFtRDtBQUV0QyxRQUFBLG1CQUFtQixHQUFHO0lBQ2pDO1FBQ0UsS0FBSyxFQUFFLFFBQVE7UUFDZixRQUFRLEVBQUUsZ0NBQWU7S0FDMUI7SUFDRDtRQUNFLEtBQUssRUFBRSxRQUFRO1FBQ2YsUUFBUSxFQUFFLGdDQUFlO0tBQzFCO0lBQ0Q7UUFDRSxLQUFLLEVBQUUsV0FBVztRQUNsQixRQUFRLEVBQUU7WUFDUixHQUFHLEVBQUUsNEJBQTRCO1lBQ2pDLElBQUksRUFBRSxrQkFBa0I7WUFDeEIsV0FBVyxFQUFFLHVDQUF1QztZQUNwRCxZQUFZLEVBQUUsS0FBSztZQUNuQixRQUFRLEVBQUUsSUFBSTtZQUNkLFdBQVcsRUFBRSxDQUFDLEtBQWEsRUFBRSxFQUFFO2dCQUM3Qiw4REFBOEQ7Z0JBQzlELE1BQU0sRUFBRSxnQkFBZ0IsRUFBRSxHQUFHLE9BQU8sQ0FBQyxjQUFJLENBQUMsT0FBTyxDQUMvQyxPQUFPLENBQUMsR0FBRyxFQUFFLEVBQ2IsS0FBSyxDQUNOLENBQUMsQ0FBQztnQkFDSCxPQUFPLGdCQUFnQixDQUFDO1lBQzFCLENBQUM7WUFDRCxvQkFBb0IsRUFBRSxHQUFHLEVBQUU7Z0JBQ3pCLDhEQUE4RDtnQkFDOUQsTUFBTSxFQUFFLGdCQUFnQixFQUFFLEdBQUcsT0FBTyxDQUFDLGNBQUksQ0FBQyxPQUFPLENBQy9DLFNBQVMsRUFDVCxtQ0FBbUMsQ0FDcEMsQ0FBQyxDQUFDO2dCQUNILE9BQU8sZ0JBQWdCLENBQUM7WUFDMUIsQ0FBQztTQUNGO0tBQ0Y7SUFDRDtRQUNFLEtBQUssRUFBRSxXQUFXO1FBQ2xCLFFBQVEsRUFBRTtZQUNSLEdBQUcsRUFBRSwyQkFBMkI7WUFDaEMsSUFBSSxFQUFFLGlCQUFpQjtZQUN2QixXQUFXLEVBQUUsc0NBQXNDO1lBQ25ELFlBQVksRUFBRSxLQUFLO1lBQ25CLFFBQVEsRUFBRSxJQUFJO1lBQ2QsV0FBVyxFQUFFLENBQUMsS0FBYSxFQUFFLEVBQUU7Z0JBQzdCLDhEQUE4RDtnQkFDOUQsTUFBTSxFQUFFLGVBQWUsRUFBRSxHQUFHLE9BQU8sQ0FBQyxjQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO2dCQUN4RSxPQUFPLGVBQWUsQ0FBQztZQUN6QixDQUFDO1lBQ0Qsb0JBQW9CLEVBQUUsR0FBRyxFQUFFO2dCQUN6Qiw4REFBOEQ7Z0JBQzlELE1BQU0sRUFBRSxlQUFlLEVBQUUsR0FBRyxPQUFPLENBQUMsY0FBSSxDQUFDLE9BQU8sQ0FDOUMsU0FBUyxFQUNULGtDQUFrQyxDQUNuQyxDQUFDLENBQUM7Z0JBQ0gsT0FBTyxlQUFlLENBQUM7WUFDekIsQ0FBQztTQUNGO0tBQ0Y7Q0FDRixDQUFDIn0=