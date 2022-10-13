"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigurationRepository = void 0;
const rxjs_1 = require("rxjs");
const tsyringe_1 = require("tsyringe");
let ConfigurationRepository = class ConfigurationRepository {
    constructor() {
        this.config = new rxjs_1.BehaviorSubject(null);
    }
};
ConfigurationRepository = __decorate([
    tsyringe_1.singleton()
], ConfigurationRepository);
exports.ConfigurationRepository = ConfigurationRepository;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlndXJhdGlvbi5yZXBvc2l0b3J5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2xpYi9jb25maWd1cmF0aW9uLnJlcG9zaXRvcnkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBQUEsK0JBQXVDO0FBQ3ZDLHVDQUFxQztBQUdyQyxJQUFhLHVCQUF1QixHQUFwQyxNQUFhLHVCQUF1QjtJQUFwQztRQUNTLFdBQU0sR0FBRyxJQUFJLHNCQUFlLENBQXNCLElBQUksQ0FBQyxDQUFDO0lBQ2pFLENBQUM7Q0FBQSxDQUFBO0FBRlksdUJBQXVCO0lBRG5DLG9CQUFTLEVBQUU7R0FDQyx1QkFBdUIsQ0FFbkM7QUFGWSwwREFBdUIifQ==