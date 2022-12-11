"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveResponseFn = void 0;
const resolve_type_fn_1 = require("./resolve-type.fn");
function isFileSchema(schema) {
    return schema.type === 'file';
}
function isSchema(schema) {
    return schema.type !== 'file';
}
function resolveResponseFn(responseSchema, methodName, swConfig) {
    if (responseSchema) {
        let resolvedType = {
            type: 'unknown',
            typeImport: [],
        };
        if (responseSchema['enum']) {
            resolvedType.type = 'number';
        }
        else if (isFileSchema(responseSchema)) {
            resolvedType = {
                type: 'Blob',
                typeImport: [],
            };
        }
        else if (isSchema(responseSchema)) {
            resolvedType = resolve_type_fn_1.resolveTypeFn(responseSchema, 'response', methodName, swConfig);
        }
        if (resolvedType.type === 'unknown') {
            return [
                {
                    type: 'Record<string, unknown> | unknown',
                    typeImport: [],
                },
            ];
        }
        else {
            return [resolvedType];
        }
    }
    else {
        return [
            {
                type: 'Record<string, unknown> | unknown',
                typeImport: [],
            },
        ];
    }
}
exports.resolveResponseFn = resolveResponseFn;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzb2x2ZS1yZXNwb25zZS5mbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9saWIvcGFyc2VyL3V0aWxzL3Jlc29sdmUtcmVzcG9uc2UuZm4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBRUEsdURBQWtEO0FBRWxELFNBQVMsWUFBWSxDQUFDLE1BQTJCO0lBQy9DLE9BQU8sTUFBTSxDQUFDLElBQUksS0FBSyxNQUFNLENBQUM7QUFDaEMsQ0FBQztBQUNELFNBQVMsUUFBUSxDQUFDLE1BQTJCO0lBQzNDLE9BQU8sTUFBTSxDQUFDLElBQUksS0FBSyxNQUFNLENBQUM7QUFDaEMsQ0FBQztBQUVELFNBQWdCLGlCQUFpQixDQUMvQixjQUErQyxFQUMvQyxVQUFrQixFQUNsQixRQUFzQjtJQUd0QixJQUFJLGNBQWMsRUFBRTtRQUNsQixJQUFJLFlBQVksR0FBdUI7WUFDckMsSUFBSSxFQUFFLFNBQVM7WUFDZixVQUFVLEVBQUUsRUFBRTtTQUNmLENBQUM7UUFDRixJQUFJLGNBQWMsQ0FBQyxNQUFNLENBQUMsRUFBRTtZQUMxQixZQUFZLENBQUMsSUFBSSxHQUFHLFFBQVEsQ0FBQztTQUM5QjthQUFNLElBQUksWUFBWSxDQUFDLGNBQWMsQ0FBQyxFQUFFO1lBQ3ZDLFlBQVksR0FBRztnQkFDYixJQUFJLEVBQUUsTUFBTTtnQkFDWixVQUFVLEVBQUUsRUFBRTthQUNmLENBQUM7U0FDSDthQUFNLElBQUksUUFBUSxDQUFDLGNBQWMsQ0FBQyxFQUFFO1lBQ25DLFlBQVksR0FBRywrQkFBYSxDQUMxQixjQUFjLEVBQ2QsVUFBVSxFQUNWLFVBQVUsRUFDVixRQUFRLENBQ1QsQ0FBQztTQUNIO1FBQ0QsSUFBSSxZQUFZLENBQUMsSUFBSSxLQUFLLFNBQVMsRUFBRTtZQUNuQyxPQUFPO2dCQUNMO29CQUNFLElBQUksRUFBRSxtQ0FBbUM7b0JBQ3pDLFVBQVUsRUFBRSxFQUFFO2lCQUNmO2FBQ0YsQ0FBQztTQUNIO2FBQU07WUFDTCxPQUFPLENBQUMsWUFBWSxDQUFDLENBQUM7U0FDdkI7S0FDRjtTQUFNO1FBQ0wsT0FBTztZQUNMO2dCQUNFLElBQUksRUFBRSxtQ0FBbUM7Z0JBQ3pDLFVBQVUsRUFBRSxFQUFFO2FBQ2Y7U0FDRixDQUFDO0tBQ0g7QUFDSCxDQUFDO0FBNUNELDhDQTRDQyJ9