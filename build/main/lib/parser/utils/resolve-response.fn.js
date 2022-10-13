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
    console.log(responseSchema);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzb2x2ZS1yZXNwb25zZS5mbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9saWIvcGFyc2VyL3V0aWxzL3Jlc29sdmUtcmVzcG9uc2UuZm4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBRUEsdURBQWtEO0FBRWxELFNBQVMsWUFBWSxDQUFDLE1BQTJCO0lBQy9DLE9BQU8sTUFBTSxDQUFDLElBQUksS0FBSyxNQUFNLENBQUM7QUFDaEMsQ0FBQztBQUNELFNBQVMsUUFBUSxDQUFDLE1BQTJCO0lBQzNDLE9BQU8sTUFBTSxDQUFDLElBQUksS0FBSyxNQUFNLENBQUM7QUFDaEMsQ0FBQztBQUVELFNBQWdCLGlCQUFpQixDQUMvQixjQUErQyxFQUMvQyxVQUFrQixFQUNsQixRQUFzQjtJQUV0QixPQUFPLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxDQUFDO0lBRTVCLElBQUksY0FBYyxFQUFFO1FBQ2xCLElBQUksWUFBWSxHQUF1QjtZQUNyQyxJQUFJLEVBQUUsU0FBUztZQUNmLFVBQVUsRUFBRSxFQUFFO1NBQ2YsQ0FBQztRQUNGLElBQUksY0FBYyxDQUFDLE1BQU0sQ0FBQyxFQUFFO1lBQzFCLFlBQVksQ0FBQyxJQUFJLEdBQUcsUUFBUSxDQUFDO1NBQzlCO2FBQU0sSUFBSSxZQUFZLENBQUMsY0FBYyxDQUFDLEVBQUU7WUFDdkMsWUFBWSxHQUFHO2dCQUNiLElBQUksRUFBRSxNQUFNO2dCQUNaLFVBQVUsRUFBRSxFQUFFO2FBQ2YsQ0FBQztTQUNIO2FBQU0sSUFBSSxRQUFRLENBQUMsY0FBYyxDQUFDLEVBQUU7WUFDbkMsWUFBWSxHQUFHLCtCQUFhLENBQzFCLGNBQWMsRUFDZCxVQUFVLEVBQ1YsVUFBVSxFQUNWLFFBQVEsQ0FDVCxDQUFDO1NBQ0g7UUFDRCxJQUFJLFlBQVksQ0FBQyxJQUFJLEtBQUssU0FBUyxFQUFFO1lBQ25DLE9BQU87Z0JBQ0w7b0JBQ0UsSUFBSSxFQUFFLG1DQUFtQztvQkFDekMsVUFBVSxFQUFFLEVBQUU7aUJBQ2Y7YUFDRixDQUFDO1NBQ0g7YUFBTTtZQUNMLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQztTQUN2QjtLQUNGO1NBQU07UUFDTCxPQUFPO1lBQ0w7Z0JBQ0UsSUFBSSxFQUFFLG1DQUFtQztnQkFDekMsVUFBVSxFQUFFLEVBQUU7YUFDZjtTQUNGLENBQUM7S0FDSDtBQUNILENBQUM7QUE3Q0QsOENBNkNDIn0=