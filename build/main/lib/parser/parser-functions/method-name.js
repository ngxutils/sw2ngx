"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.methodNameParser = void 0;
const change_case_1 = require("change-case");
function methodNameParser(uri, type, id = '') {
    if (id !== '') {
        return id;
    }
    const tmp = change_case_1.pascalCase(uri.replace(/\//gi, '-').replace(/\{|\}|\$/gi, ''));
    switch (type.toLocaleLowerCase()) {
        case 'post':
            return 'send' + tmp;
        case 'delete':
            return 'delete' + tmp;
        case 'put':
            return 'update' + tmp;
        case 'get':
        default:
            return 'get' + tmp;
    }
}
exports.methodNameParser = methodNameParser;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWV0aG9kLW5hbWUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvbGliL3BhcnNlci9wYXJzZXItZnVuY3Rpb25zL21ldGhvZC1uYW1lLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLDZDQUF5QztBQUV6QyxTQUFnQixnQkFBZ0IsQ0FBQyxHQUFXLEVBQUUsSUFBWSxFQUFFLEVBQUUsR0FBRyxFQUFFO0lBQ2pFLElBQUksRUFBRSxLQUFLLEVBQUUsRUFBRTtRQUNiLE9BQU8sRUFBRSxDQUFDO0tBQ1g7SUFDRCxNQUFNLEdBQUcsR0FBRyx3QkFBVSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxZQUFZLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUMzRSxRQUFRLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxFQUFFO1FBQ2hDLEtBQUssTUFBTTtZQUNULE9BQU8sTUFBTSxHQUFHLEdBQUcsQ0FBQztRQUN0QixLQUFLLFFBQVE7WUFDWCxPQUFPLFFBQVEsR0FBRyxHQUFHLENBQUM7UUFDeEIsS0FBSyxLQUFLO1lBQ1IsT0FBTyxRQUFRLEdBQUcsR0FBRyxDQUFDO1FBQ3hCLEtBQUssS0FBSyxDQUFDO1FBQ1g7WUFDRSxPQUFPLEtBQUssR0FBRyxHQUFHLENBQUM7S0FDdEI7QUFDSCxDQUFDO0FBaEJELDRDQWdCQyJ9