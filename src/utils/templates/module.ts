export class ModuleTemplate {

    public compile(value: string[]) {
        const servicesList: string[] = [];
        for(const el of value){
            servicesList.push(`${el}APIService,`);
        }
        const importsHead: string = servicesList.join('\r\n\t');
        const importsBody: string = servicesList.join('\r\n\t\t\t\t');
        return `
import { NgModule, ModuleWithProviders } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import {
    ${importsHead}
} from './services';

@NgModule({
  imports: [
    HttpClientModule
  ],
  exports: [],
  declarations: [],
  providers: [
  ],
})
export class APIModule {
  public static forRoot(): ModuleWithProviders {
        return {
            ngModule: APIModule,
            providers: [
                ${importsBody}
            ],
        };
    }
}
`;
    }
}