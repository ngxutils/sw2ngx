var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import * as fs from 'fs';
import { injectable } from 'tsyringe';
let JsonConfigHelper = class JsonConfigHelper {
    getConfig(path) {
        let config = {};
        try {
            config = JSON.parse(fs.readFileSync(path).toString());
        }
        catch (e) {
            return {};
        }
        return config;
    }
};
JsonConfigHelper = __decorate([
    injectable()
], JsonConfigHelper);
export { JsonConfigHelper };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoianNvbi1jb25maWcuaGVscGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2xpYi9qc29uLWNvbmZpZy5oZWxwZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsT0FBTyxLQUFLLEVBQUUsTUFBTSxJQUFJLENBQUM7QUFFekIsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUd0QyxJQUFhLGdCQUFnQixHQUE3QixNQUFhLGdCQUFnQjtJQUMzQixTQUFTLENBQUMsSUFBWTtRQUNwQixJQUFJLE1BQU0sR0FBRyxFQUFrQixDQUFDO1FBQ2hDLElBQUk7WUFDRixNQUFNLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7U0FDdkQ7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNWLE9BQU8sRUFBa0IsQ0FBQztTQUMzQjtRQUNELE9BQU8sTUFBTSxDQUFDO0lBQ2hCLENBQUM7Q0FDRixDQUFBO0FBVlksZ0JBQWdCO0lBRDVCLFVBQVUsRUFBRTtHQUNBLGdCQUFnQixDQVU1QjtTQVZZLGdCQUFnQiJ9