import { FileSchema, Operation, Schema } from '../../../types/swagger';
export declare type MethodType = 'post' | 'put' | 'get' | 'delete' | 'head' | 'options';
export declare function resolveMethodFn(path: string, methodType: MethodType, method: Operation, methodResponse: Schema | FileSchema | undefined, swConfig: Sw2NgxConfig): Sw2NgxServiceMethod;
