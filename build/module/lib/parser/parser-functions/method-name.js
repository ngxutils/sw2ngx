import { pascalCase } from 'change-case';
export function methodNameParser(uri, type, id = '') {
    if (id !== '') {
        return id;
    }
    const tmp = pascalCase(uri.replace(/\//gi, '-').replace(/\{|\}|\$/gi, ''));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWV0aG9kLW5hbWUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvbGliL3BhcnNlci9wYXJzZXItZnVuY3Rpb25zL21ldGhvZC1uYW1lLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxhQUFhLENBQUM7QUFFekMsTUFBTSxVQUFVLGdCQUFnQixDQUFDLEdBQVcsRUFBRSxJQUFZLEVBQUUsRUFBRSxHQUFHLEVBQUU7SUFDakUsSUFBSSxFQUFFLEtBQUssRUFBRSxFQUFFO1FBQ2IsT0FBTyxFQUFFLENBQUM7S0FDWDtJQUNELE1BQU0sR0FBRyxHQUFHLFVBQVUsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsWUFBWSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDM0UsUUFBUSxJQUFJLENBQUMsaUJBQWlCLEVBQUUsRUFBRTtRQUNoQyxLQUFLLE1BQU07WUFDVCxPQUFPLE1BQU0sR0FBRyxHQUFHLENBQUM7UUFDdEIsS0FBSyxRQUFRO1lBQ1gsT0FBTyxRQUFRLEdBQUcsR0FBRyxDQUFDO1FBQ3hCLEtBQUssS0FBSztZQUNSLE9BQU8sUUFBUSxHQUFHLEdBQUcsQ0FBQztRQUN4QixLQUFLLEtBQUssQ0FBQztRQUNYO1lBQ0UsT0FBTyxLQUFLLEdBQUcsR0FBRyxDQUFDO0tBQ3RCO0FBQ0gsQ0FBQyJ9