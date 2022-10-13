"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SwaggerConfigLoader = void 0;
const fs_1 = __importDefault(require("fs"));
const node_fetch_1 = __importDefault(require("node-fetch"));
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const tsyringe_1 = require("tsyringe");
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
        const swaggerConfig = new rxjs_1.BehaviorSubject(null);
        node_fetch_1.default(configPath)
            .catch((err) => {
            swaggerConfig.error(`[ERROR]: loading swagger.json (Stack Trace: ) ${JSON.stringify(err)}`);
            return Promise.reject(err);
        })
            .then((res) => res.json())
            .then((config) => swaggerConfig.next(config))
            .catch((err) => swaggerConfig.error(`[ERROR]: Parsing swagger json (Stack Trace: ) ${JSON.stringify(err)}`));
        return swaggerConfig.pipe(operators_1.filter((x) => !!x));
    }
    getByFilePath(configPath) {
        const swaggerConfig = new rxjs_1.BehaviorSubject(null);
        try {
            const config = JSON.parse(fs_1.default.readFileSync(configPath, 'utf-8'));
            swaggerConfig.next(config);
        }
        catch (err) {
            swaggerConfig.error(`[ERROR]: Load or parsing swagger config (Stack Trace: ) ${JSON.stringify(err)}`);
        }
        return swaggerConfig.pipe(operators_1.filter((x) => !!x));
    }
};
SwaggerConfigLoader = __decorate([
    tsyringe_1.singleton()
], SwaggerConfigLoader);
exports.SwaggerConfigLoader = SwaggerConfigLoader;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlnLmxvYWRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9saWIvcGFyc2VyL2NvbmZpZy5sb2FkZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUEsNENBQW9CO0FBRXBCLDREQUErQjtBQUMvQiwrQkFBbUQ7QUFDbkQsOENBQXdDO0FBQ3hDLHVDQUFxQztBQUdyQyxJQUFhLG1CQUFtQixHQUFoQyxNQUFhLG1CQUFtQjtJQUM5QixVQUFVLENBQUMsVUFBa0I7UUFDM0IsSUFBSSxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLEVBQUU7WUFDeEMsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1NBQ2xDO2FBQU07WUFDTCxPQUFPLElBQUksQ0FBQyxhQUFhLENBQUMsVUFBVSxDQUFDLENBQUM7U0FDdkM7SUFDSCxDQUFDO0lBRU8sUUFBUSxDQUFDLFVBQWtCO1FBQ2pDLE1BQU0sYUFBYSxHQUFHLElBQUksc0JBQWUsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNoRCxvQkFBSyxDQUFDLFVBQVUsQ0FBQzthQUNkLEtBQUssQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFFO1lBQ2IsYUFBYSxDQUFDLEtBQUssQ0FDakIsaURBQWlELElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FDdkUsQ0FBQztZQUNGLE9BQU8sT0FBTyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUM3QixDQUFDLENBQUM7YUFDRCxJQUFJLENBQUMsQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsQ0FBQzthQUN6QixJQUFJLENBQUMsQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7YUFDNUMsS0FBSyxDQUFDLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FDYixhQUFhLENBQUMsS0FBSyxDQUNqQixpREFBaUQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUN2RSxDQUNGLENBQUM7UUFDSixPQUFPLGFBQWEsQ0FBQyxJQUFJLENBQUMsa0JBQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDaEQsQ0FBQztJQUNPLGFBQWEsQ0FBQyxVQUFrQjtRQUN0QyxNQUFNLGFBQWEsR0FBRyxJQUFJLHNCQUFlLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDaEQsSUFBSTtZQUNGLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsWUFBRSxDQUFDLFlBQVksQ0FBQyxVQUFVLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQztZQUNoRSxhQUFhLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1NBQzVCO1FBQUMsT0FBTyxHQUFHLEVBQUU7WUFDWixhQUFhLENBQUMsS0FBSyxDQUNqQiwyREFBMkQsSUFBSSxDQUFDLFNBQVMsQ0FDdkUsR0FBRyxDQUNKLEVBQUUsQ0FDSixDQUFDO1NBQ0g7UUFFRCxPQUFPLGFBQWEsQ0FBQyxJQUFJLENBQUMsa0JBQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDaEQsQ0FBQztDQUNGLENBQUE7QUExQ1ksbUJBQW1CO0lBRC9CLG9CQUFTLEVBQUU7R0FDQyxtQkFBbUIsQ0EwQy9CO0FBMUNZLGtEQUFtQiJ9