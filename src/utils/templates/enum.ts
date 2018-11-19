import { IParserEnum } from './../../interfaces/parser';
export class EnumTemplate {
    public body(value: IParserEnum): string {
        const temp: string[] = [];
        for(const param of value.value){
            temp.push( `${param.key}= ${param.val}`);
        }
        return temp.join(',\r\n\t');
    }
    public compile(value: IParserEnum){
        return `
export enum ${value.name} {
    ${this.body(value)}
}
`;
    }
}