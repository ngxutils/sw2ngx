import { Observable } from 'rxjs';
export declare class SwaggerConfigLoader {
    loadConfig(configPath: string): Observable<any>;
    private getByUrl;
    private getByFilePath;
}
