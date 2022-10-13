"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
const tsyringe_1 = require("tsyringe");
let Logger = class Logger {
    constructor(colors) {
        this.colors = colors;
        this.colorsMap = this.colors.reduce((x, y) => {
            return Object.assign(Object.assign({}, x), { [y.type]: y.color });
        }, {});
    }
    reset() {
        process.stdout.write(this.colorsMap.Help.reset);
        return this;
    }
    bg(color) {
        process.stdout.write(this.colorsMap.Background[color]);
        return this;
    }
    fg(color) {
        process.stdout.write(this.colorsMap.Text[color]);
        return this;
    }
    write(line) {
        process.stdout.write(line);
        return this;
    }
    writeln(line) {
        process.stdout.write(line);
        process.stdout.write('\r\n');
        return this;
    }
    info(message) {
        this.reset().writeln('').fg('blue').writeln(message).reset();
    }
    err(message) {
        this.reset().writeln('').fg('red').writeln(message).reset();
    }
    ok(message) {
        this.reset().writeln('').fg('green').writeln(message).reset();
    }
};
Logger = __decorate([
    tsyringe_1.singleton(),
    __param(0, tsyringe_1.injectAll('LOGGER_COLORS')),
    __metadata("design:paramtypes", [Array])
], Logger);
exports.Logger = Logger;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9nZ2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2xpYi9sb2dnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsdUNBQWdEO0FBR2hELElBQWEsTUFBTSxHQUFuQixNQUFhLE1BQU07SUFFakIsWUFBZ0QsTUFBMkI7UUFBM0IsV0FBTSxHQUFOLE1BQU0sQ0FBcUI7UUFDekUsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUMzQyx1Q0FDSyxDQUFDLEtBQ0osQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEtBQUssSUFDakI7UUFDSixDQUFDLEVBQUUsRUFBRSxDQUE2QyxDQUFDO0lBQ3JELENBQUM7SUFDTSxLQUFLO1FBQ1YsT0FBTyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDaEQsT0FBTyxJQUFJLENBQUM7SUFDZCxDQUFDO0lBQ00sRUFBRSxDQUFDLEtBQWE7UUFDckIsT0FBTyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztRQUN2RCxPQUFPLElBQUksQ0FBQztJQUNkLENBQUM7SUFDTSxFQUFFLENBQUMsS0FBYTtRQUNyQixPQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBQ2pELE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQztJQUNNLEtBQUssQ0FBQyxJQUFZO1FBQ3ZCLE9BQU8sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzNCLE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQztJQUNNLE9BQU8sQ0FBQyxJQUFZO1FBQ3pCLE9BQU8sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzNCLE9BQU8sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQzdCLE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQztJQUNNLElBQUksQ0FBQyxPQUFlO1FBQ3pCLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUMvRCxDQUFDO0lBQ00sR0FBRyxDQUFDLE9BQWU7UUFDeEIsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDO0lBQzlELENBQUM7SUFDTSxFQUFFLENBQUMsT0FBZTtRQUN2QixJQUFJLENBQUMsS0FBSyxFQUFFLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUM7SUFDaEUsQ0FBQztDQUNGLENBQUE7QUF4Q1ksTUFBTTtJQURsQixvQkFBUyxFQUFFO0lBR0csV0FBQSxvQkFBUyxDQUFDLGVBQWUsQ0FBQyxDQUFBOztHQUY1QixNQUFNLENBd0NsQjtBQXhDWSx3QkFBTSJ9