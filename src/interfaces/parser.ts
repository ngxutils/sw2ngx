export interface IParserEnum {
    name: string;
    value: {
        key: string;
        val: number;
    }[];
    modelName: string;
    hash: string;
}
export interface IParserServiceList{
    [key:string]: IParserService
}

export interface IParserService {
    uri: string,
    imports: string[],
    methods: IParserMethod[]
}
export interface IParserModel {
    name: string;
    description: string;
    imports: string[];
    props: any[];
}
export interface IParserResolvedType {
    typeName: string;
    typeImport: string | null;
}
export interface IParserMethod {
    uri: string;
    type: string;
    tag: string;
    name: string;
    description: string;
    params: {
        [key:string]: IParserParam[]
    };
    resp: IParserResolvedType[];
}

export interface IParserParam {
    name: string;
    queryName: string;
    description: string;
    required: boolean;
    type: IParserResolvedType;
    default?:string;
}
