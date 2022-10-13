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
import { injectAll, singleton } from 'tsyringe';
let Logger = class Logger {
    colors;
    colorsMap;
    constructor(colors) {
        this.colors = colors;
        this.colorsMap = this.colors.reduce((x, y) => {
            return {
                ...x,
                [y.type]: y.color,
            };
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
    singleton(),
    __param(0, injectAll('LOGGER_COLORS')),
    __metadata("design:paramtypes", [Array])
], Logger);
export { Logger };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9nZ2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2xpYi9sb2dnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFHaEQsSUFBYSxNQUFNLEdBQW5CLE1BQWEsTUFBTTtJQUUrQjtJQUR4QyxTQUFTLENBQTJDO0lBQzVELFlBQWdELE1BQTJCO1FBQTNCLFdBQU0sR0FBTixNQUFNLENBQXFCO1FBQ3pFLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDM0MsT0FBTztnQkFDTCxHQUFHLENBQUM7Z0JBQ0osQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEtBQUs7YUFDbEIsQ0FBQztRQUNKLENBQUMsRUFBRSxFQUFFLENBQTZDLENBQUM7SUFDckQsQ0FBQztJQUNNLEtBQUs7UUFDVixPQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNoRCxPQUFPLElBQUksQ0FBQztJQUNkLENBQUM7SUFDTSxFQUFFLENBQUMsS0FBYTtRQUNyQixPQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBQ3ZELE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQztJQUNNLEVBQUUsQ0FBQyxLQUFhO1FBQ3JCLE9BQU8sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFDakQsT0FBTyxJQUFJLENBQUM7SUFDZCxDQUFDO0lBQ00sS0FBSyxDQUFDLElBQVk7UUFDdkIsT0FBTyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDM0IsT0FBTyxJQUFJLENBQUM7SUFDZCxDQUFDO0lBQ00sT0FBTyxDQUFDLElBQVk7UUFDekIsT0FBTyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDM0IsT0FBTyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDN0IsT0FBTyxJQUFJLENBQUM7SUFDZCxDQUFDO0lBQ00sSUFBSSxDQUFDLE9BQWU7UUFDekIsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDO0lBQy9ELENBQUM7SUFDTSxHQUFHLENBQUMsT0FBZTtRQUN4QixJQUFJLENBQUMsS0FBSyxFQUFFLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUM7SUFDOUQsQ0FBQztJQUNNLEVBQUUsQ0FBQyxPQUFlO1FBQ3ZCLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUNoRSxDQUFDO0NBQ0YsQ0FBQTtBQXhDWSxNQUFNO0lBRGxCLFNBQVMsRUFBRTtJQUdHLFdBQUEsU0FBUyxDQUFDLGVBQWUsQ0FBQyxDQUFBOztHQUY1QixNQUFNLENBd0NsQjtTQXhDWSxNQUFNIn0=