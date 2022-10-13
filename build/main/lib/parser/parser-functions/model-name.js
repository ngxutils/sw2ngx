"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.modelNameParser = void 0;
const modelsNameMap = new Map();
function modelNameParser(name) {
    if (modelsNameMap.has(name)) {
        return modelsNameMap.get(name) || name;
    }
    const typeName = name.split('/').pop() || name;
    modelsNameMap.set(name, typeName);
    return typeName;
}
exports.modelNameParser = modelNameParser;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9kZWwtbmFtZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9saWIvcGFyc2VyL3BhcnNlci1mdW5jdGlvbnMvbW9kZWwtbmFtZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxNQUFNLGFBQWEsR0FBRyxJQUFJLEdBQUcsRUFBa0IsQ0FBQztBQUVoRCxTQUFnQixlQUFlLENBQUMsSUFBWTtJQUMxQyxJQUFJLGFBQWEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUU7UUFDM0IsT0FBTyxhQUFhLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQztLQUN4QztJQUNELE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxFQUFFLElBQUksSUFBSSxDQUFDO0lBQy9DLGFBQWEsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLFFBQVEsQ0FBQyxDQUFDO0lBQ2xDLE9BQU8sUUFBUSxDQUFDO0FBQ2xCLENBQUM7QUFQRCwwQ0FPQyJ9