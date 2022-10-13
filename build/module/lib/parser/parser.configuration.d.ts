import { OpenApiV3Parser } from './openapi.parser';
import { OpenApiV2Parser } from './swagger.parser';
export declare const parserConfiguration: ({
    token: string;
    useClass: typeof OpenApiV2Parser;
    useValue?: undefined;
} | {
    token: string;
    useClass: typeof OpenApiV3Parser;
    useValue?: undefined;
} | {
    token: string;
    useValue: {
        key: string;
        name: string;
        description: string;
        withoutValue: boolean;
        required: boolean;
        valueParser: (value: string) => any;
        defaultValueFunction: () => any;
    };
    useClass?: undefined;
})[];
