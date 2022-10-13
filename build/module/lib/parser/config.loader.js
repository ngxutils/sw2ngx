var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import fs from 'fs';
import fetch from 'node-fetch';
import { BehaviorSubject } from 'rxjs';
import { filter } from 'rxjs/operators';
import { singleton } from 'tsyringe';
let SwaggerConfigLoader = class SwaggerConfigLoader {
    loadConfig(configPath) {
        if (/http(s?):\/\/\S/gi.test(configPath)) {
            return this.getByUrl(configPath);
        }
        else {
            return this.getByFilePath(configPath);
        }
    }
    getByUrl(configPath) {
        const swaggerConfig = new BehaviorSubject(null);
        fetch(configPath)
            .catch((err) => {
            swaggerConfig.error(`[ERROR]: loading swagger.json (Stack Trace: ) ${JSON.stringify(err)}`);
            return Promise.reject(err);
        })
            .then((res) => res.json())
            .then((config) => swaggerConfig.next(config))
            .catch((err) => swaggerConfig.error(`[ERROR]: Parsing swagger json (Stack Trace: ) ${JSON.stringify(err)}`));
        return swaggerConfig.pipe(filter((x) => !!x));
    }
    getByFilePath(configPath) {
        const swaggerConfig = new BehaviorSubject(null);
        try {
            const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
            swaggerConfig.next(config);
        }
        catch (err) {
            swaggerConfig.error(`[ERROR]: Load or parsing swagger config (Stack Trace: ) ${JSON.stringify(err)}`);
        }
        return swaggerConfig.pipe(filter((x) => !!x));
    }
};
SwaggerConfigLoader = __decorate([
    singleton()
], SwaggerConfigLoader);
export { SwaggerConfigLoader };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlnLmxvYWRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9saWIvcGFyc2VyL2NvbmZpZy5sb2FkZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsT0FBTyxFQUFFLE1BQU0sSUFBSSxDQUFDO0FBRXBCLE9BQU8sS0FBSyxNQUFNLFlBQVksQ0FBQztBQUMvQixPQUFPLEVBQUUsZUFBZSxFQUFjLE1BQU0sTUFBTSxDQUFDO0FBQ25ELE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUN4QyxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sVUFBVSxDQUFDO0FBR3JDLElBQWEsbUJBQW1CLEdBQWhDLE1BQWEsbUJBQW1CO0lBQzlCLFVBQVUsQ0FBQyxVQUFrQjtRQUMzQixJQUFJLG1CQUFtQixDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsRUFBRTtZQUN4QyxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLENBQUM7U0FDbEM7YUFBTTtZQUNMLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxVQUFVLENBQUMsQ0FBQztTQUN2QztJQUNILENBQUM7SUFFTyxRQUFRLENBQUMsVUFBa0I7UUFDakMsTUFBTSxhQUFhLEdBQUcsSUFBSSxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDaEQsS0FBSyxDQUFDLFVBQVUsQ0FBQzthQUNkLEtBQUssQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFFO1lBQ2IsYUFBYSxDQUFDLEtBQUssQ0FDakIsaURBQWlELElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FDdkUsQ0FBQztZQUNGLE9BQU8sT0FBTyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUM3QixDQUFDLENBQUM7YUFDRCxJQUFJLENBQUMsQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsQ0FBQzthQUN6QixJQUFJLENBQUMsQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7YUFDNUMsS0FBSyxDQUFDLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FDYixhQUFhLENBQUMsS0FBSyxDQUNqQixpREFBaUQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUN2RSxDQUNGLENBQUM7UUFDSixPQUFPLGFBQWEsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNoRCxDQUFDO0lBQ08sYUFBYSxDQUFDLFVBQWtCO1FBQ3RDLE1BQU0sYUFBYSxHQUFHLElBQUksZUFBZSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2hELElBQUk7WUFDRixNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxZQUFZLENBQUMsVUFBVSxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUM7WUFDaEUsYUFBYSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztTQUM1QjtRQUFDLE9BQU8sR0FBRyxFQUFFO1lBQ1osYUFBYSxDQUFDLEtBQUssQ0FDakIsMkRBQTJELElBQUksQ0FBQyxTQUFTLENBQ3ZFLEdBQUcsQ0FDSixFQUFFLENBQ0osQ0FBQztTQUNIO1FBRUQsT0FBTyxhQUFhLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDaEQsQ0FBQztDQUNGLENBQUE7QUExQ1ksbUJBQW1CO0lBRC9CLFNBQVMsRUFBRTtHQUNDLG1CQUFtQixDQTBDL0I7U0ExQ1ksbUJBQW1CIn0=