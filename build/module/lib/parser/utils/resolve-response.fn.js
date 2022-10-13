import { resolveTypeFn } from './resolve-type.fn';
function isFileSchema(schema) {
    return schema.type === 'file';
}
function isSchema(schema) {
    return schema.type !== 'file';
}
export function resolveResponseFn(responseSchema, methodName, swConfig) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzb2x2ZS1yZXNwb25zZS5mbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9saWIvcGFyc2VyL3V0aWxzL3Jlc29sdmUtcmVzcG9uc2UuZm4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBRUEsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBRWxELFNBQVMsWUFBWSxDQUFDLE1BQTJCO0lBQy9DLE9BQU8sTUFBTSxDQUFDLElBQUksS0FBSyxNQUFNLENBQUM7QUFDaEMsQ0FBQztBQUNELFNBQVMsUUFBUSxDQUFDLE1BQTJCO0lBQzNDLE9BQU8sTUFBTSxDQUFDLElBQUksS0FBSyxNQUFNLENBQUM7QUFDaEMsQ0FBQztBQUVELE1BQU0sVUFBVSxpQkFBaUIsQ0FDL0IsY0FBK0MsRUFDL0MsVUFBa0IsRUFDbEIsUUFBc0I7SUFFdEIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsQ0FBQztJQUU1QixJQUFJLGNBQWMsRUFBRTtRQUNsQixJQUFJLFlBQVksR0FBdUI7WUFDckMsSUFBSSxFQUFFLFNBQVM7WUFDZixVQUFVLEVBQUUsRUFBRTtTQUNmLENBQUM7UUFDRixJQUFJLGNBQWMsQ0FBQyxNQUFNLENBQUMsRUFBRTtZQUMxQixZQUFZLENBQUMsSUFBSSxHQUFHLFFBQVEsQ0FBQztTQUM5QjthQUFNLElBQUksWUFBWSxDQUFDLGNBQWMsQ0FBQyxFQUFFO1lBQ3ZDLFlBQVksR0FBRztnQkFDYixJQUFJLEVBQUUsTUFBTTtnQkFDWixVQUFVLEVBQUUsRUFBRTthQUNmLENBQUM7U0FDSDthQUFNLElBQUksUUFBUSxDQUFDLGNBQWMsQ0FBQyxFQUFFO1lBQ25DLFlBQVksR0FBRyxhQUFhLENBQzFCLGNBQWMsRUFDZCxVQUFVLEVBQ1YsVUFBVSxFQUNWLFFBQVEsQ0FDVCxDQUFDO1NBQ0g7UUFDRCxJQUFJLFlBQVksQ0FBQyxJQUFJLEtBQUssU0FBUyxFQUFFO1lBQ25DLE9BQU87Z0JBQ0w7b0JBQ0UsSUFBSSxFQUFFLG1DQUFtQztvQkFDekMsVUFBVSxFQUFFLEVBQUU7aUJBQ2Y7YUFDRixDQUFDO1NBQ0g7YUFBTTtZQUNMLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQztTQUN2QjtLQUNGO1NBQU07UUFDTCxPQUFPO1lBQ0w7Z0JBQ0UsSUFBSSxFQUFFLG1DQUFtQztnQkFDekMsVUFBVSxFQUFFLEVBQUU7YUFDZjtTQUNGLENBQUM7S0FDSDtBQUNILENBQUMifQ==