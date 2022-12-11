import { resolveTypeFn } from './resolve-type.fn';
function isFileSchema(schema) {
    return schema.type === 'file';
}
function isSchema(schema) {
    return schema.type !== 'file';
}
export function resolveResponseFn(responseSchema, methodName, swConfig) {
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
            resolvedType = resolveTypeFn(responseSchema, 'response', methodName, swConfig);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzb2x2ZS1yZXNwb25zZS5mbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9saWIvcGFyc2VyL3V0aWxzL3Jlc29sdmUtcmVzcG9uc2UuZm4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBRUEsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBRWxELFNBQVMsWUFBWSxDQUFDLE1BQTJCO0lBQy9DLE9BQU8sTUFBTSxDQUFDLElBQUksS0FBSyxNQUFNLENBQUM7QUFDaEMsQ0FBQztBQUNELFNBQVMsUUFBUSxDQUFDLE1BQTJCO0lBQzNDLE9BQU8sTUFBTSxDQUFDLElBQUksS0FBSyxNQUFNLENBQUM7QUFDaEMsQ0FBQztBQUVELE1BQU0sVUFBVSxpQkFBaUIsQ0FDL0IsY0FBK0MsRUFDL0MsVUFBa0IsRUFDbEIsUUFBc0I7SUFHdEIsSUFBSSxjQUFjLEVBQUU7UUFDbEIsSUFBSSxZQUFZLEdBQXVCO1lBQ3JDLElBQUksRUFBRSxTQUFTO1lBQ2YsVUFBVSxFQUFFLEVBQUU7U0FDZixDQUFDO1FBQ0YsSUFBSSxjQUFjLENBQUMsTUFBTSxDQUFDLEVBQUU7WUFDMUIsWUFBWSxDQUFDLElBQUksR0FBRyxRQUFRLENBQUM7U0FDOUI7YUFBTSxJQUFJLFlBQVksQ0FBQyxjQUFjLENBQUMsRUFBRTtZQUN2QyxZQUFZLEdBQUc7Z0JBQ2IsSUFBSSxFQUFFLE1BQU07Z0JBQ1osVUFBVSxFQUFFLEVBQUU7YUFDZixDQUFDO1NBQ0g7YUFBTSxJQUFJLFFBQVEsQ0FBQyxjQUFjLENBQUMsRUFBRTtZQUNuQyxZQUFZLEdBQUcsYUFBYSxDQUMxQixjQUFjLEVBQ2QsVUFBVSxFQUNWLFVBQVUsRUFDVixRQUFRLENBQ1QsQ0FBQztTQUNIO1FBQ0QsSUFBSSxZQUFZLENBQUMsSUFBSSxLQUFLLFNBQVMsRUFBRTtZQUNuQyxPQUFPO2dCQUNMO29CQUNFLElBQUksRUFBRSxtQ0FBbUM7b0JBQ3pDLFVBQVUsRUFBRSxFQUFFO2lCQUNmO2FBQ0YsQ0FBQztTQUNIO2FBQU07WUFDTCxPQUFPLENBQUMsWUFBWSxDQUFDLENBQUM7U0FDdkI7S0FDRjtTQUFNO1FBQ0wsT0FBTztZQUNMO2dCQUNFLElBQUksRUFBRSxtQ0FBbUM7Z0JBQ3pDLFVBQVUsRUFBRSxFQUFFO2FBQ2Y7U0FDRixDQUFDO0tBQ0g7QUFDSCxDQUFDIn0=