import { IParserEnum } from './../../interfaces/parser';
export class EnumTemplate {
    public body(value: IParserEnum): string {
        const temp: string[] = [];
        for(const param of value.value){
            temp.push( `${param.key}= ${parseInt( param.val.toString() ,10).toString() !== 'NaN' ? param.val: '"'+param.val+'"'}`);
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