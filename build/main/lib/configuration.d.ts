export declare const configuration: ({
    token: string;
    useValue: {
        key: string;
        name: string;
        description: string;
        withoutValue: boolean;
        required: boolean;
        default?: undefined;
        defaultValueFunction?: undefined;
        type?: undefined;
        color?: undefined;
    };
} | {
    token: string;
    useValue: {
        key: string;
        name: string;
        description: string;
        withoutValue: boolean;
        required: boolean;
        default: string;
        defaultValueFunction?: undefined;
        type?: undefined;
        color?: undefined;
    };
} | {
    token: string;
    useValue: {
        key: string;
        name: string;
        description: string;
        withoutValue: boolean;
        required: boolean;
        defaultValueFunction: () => string;
        default?: undefined;
        type?: undefined;
        color?: undefined;
    };
} | {
    token: string;
    useValue: {
        key: string;
        name: string;
        description: string;
        withoutValue: boolean;
        required: boolean;
        default: boolean;
        defaultValueFunction?: undefined;
        type?: undefined;
        color?: undefined;
    };
} | {
    token: string;
    useValue: {
        type: string;
        color: {
            reset: string;
            bright: string;
            dim: string;
            underscore: string;
            blink: string;
            reverse: string;
            hidden: string;
            black?: undefined;
            red?: undefined;
            green?: undefined;
            yellow?: undefined;
            blue?: undefined;
            magenta?: undefined;
            cyan?: undefined;
            white?: undefined;
        };
        key?: undefined;
        name?: undefined;
        description?: undefined;
        withoutValue?: undefined;
        required?: undefined;
        default?: undefined;
        defaultValueFunction?: undefined;
    };
} | {
    token: string;
    useValue: {
        type: string;
        color: {
            black: string;
            red: string;
            green: string;
            yellow: string;
            blue: string;
            magenta: string;
            cyan: string;
            white: string;
            reset?: undefined;
            bright?: undefined;
            dim?: undefined;
            underscore?: undefined;
            blink?: undefined;
            reverse?: undefined;
            hidden?: undefined;
        };
        key?: undefined;
        name?: undefined;
        description?: undefined;
        withoutValue?: undefined;
        required?: undefined;
        default?: undefined;
        defaultValueFunction?: undefined;
    };
})[];
