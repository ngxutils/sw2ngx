"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveImportsFn = void 0;
function resolveImportsFn(imports) {
    const filteredImports = imports.filter((x) => x !== null);
    return [...new Set(filteredImports)];
}
exports.resolveImportsFn = resolveImportsFn;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzb2x2ZS1pbXBvcnRzLmZuLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL2xpYi9wYXJzZXIvdXRpbHMvcmVzb2x2ZS1pbXBvcnRzLmZuLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLFNBQWdCLGdCQUFnQixDQUFDLE9BQTBCO0lBQ3pELE1BQU0sZUFBZSxHQUFhLE9BQU8sQ0FBQyxNQUFNLENBQzlDLENBQUMsQ0FBQyxFQUFlLEVBQUUsQ0FBQyxDQUFDLEtBQUssSUFBSSxDQUMvQixDQUFDO0lBQ0YsT0FBTyxDQUFDLEdBQUcsSUFBSSxHQUFHLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQztBQUN2QyxDQUFDO0FBTEQsNENBS0MifQ==