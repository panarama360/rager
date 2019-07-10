import {Player} from "./Player";

export enum DECORATOR_TYPES {
    CONTROLLER = 'controller',
    EVENT = 'event',
    COMMAND = 'command',
    MIDDLEWARES = 'middlewares',
    ERROR = 'error',
    SUCCESS = 'success',
    ENTER_STAGE = 'enter_stage',
    LEAVE_STAGE = 'leave_stage',
    PARAM = 'param',
}

export function MpController(options?: { name?: string, onlyThis?: boolean, global?: boolean }): Function {
    return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
        Reflect.defineMetadata(DECORATOR_TYPES.CONTROLLER, options || {}, target);
    }
}


export function MpEvent(name: string) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const metadata = Reflect.getMetadata(DECORATOR_TYPES.EVENT, target.constructor) || [];
        metadata.push({name, propertyKey});
        Reflect.defineMetadata(DECORATOR_TYPES.EVENT, metadata, target.constructor);
        return descriptor;
    }
}

export function MpCommand(name: string): Function {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const metadata = Reflect.getMetadata(DECORATOR_TYPES.COMMAND, target.constructor) || [];
        metadata.push({name, propertyKey});
        Reflect.defineMetadata(DECORATOR_TYPES.COMMAND, metadata, target.constructor);
        return descriptor;
    }
}

export function MpOnSuccess(event: string): Function {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const metadata = Reflect.getMetadata(DECORATOR_TYPES.SUCCESS, target.constructor) || [];
        metadata.push({event, propertyKey});
        Reflect.defineMetadata(DECORATOR_TYPES.SUCCESS, metadata, target.constructor);
        return descriptor;
    }
}

export function MpOnError(event: string): Function {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const metadata = Reflect.getMetadata(DECORATOR_TYPES.ERROR, target.constructor) || [];
        metadata.push({event, propertyKey});
        Reflect.defineMetadata(DECORATOR_TYPES.ERROR, metadata, target.constructor);
        return descriptor;
    }
}

export function MpMiddleware(use: (player: Player, ...args) => Promise<void> | void): Function {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        let metadata;
        if (target && propertyKey)
            metadata = Reflect.getMetadata(DECORATOR_TYPES.MIDDLEWARES, target.constructor) || [];
        else
            metadata = Reflect.getMetadata(DECORATOR_TYPES.MIDDLEWARES, target) || [];

        metadata.push({use, propertyKey});
        if (target && propertyKey)
            Reflect.defineMetadata(DECORATOR_TYPES.MIDDLEWARES, metadata, target.constructor);
        else
            Reflect.defineMetadata(DECORATOR_TYPES.MIDDLEWARES, metadata, target);
        return descriptor;
    }
}

export function MpEnterStage(): Function {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const metadata = Reflect.getMetadata(DECORATOR_TYPES.ENTER_STAGE, target.constructor) || [];
        metadata.push({propertyKey});
        Reflect.defineMetadata(DECORATOR_TYPES.ENTER_STAGE, metadata, target.constructor);
        return descriptor;
    }
}

export function MpLeaveStage(): Function {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const metadata = Reflect.getMetadata(DECORATOR_TYPES.LEAVE_STAGE, target.constructor) || [];
        metadata.push({propertyKey});
        Reflect.defineMetadata(DECORATOR_TYPES.LEAVE_STAGE, metadata, target.constructor);
        return descriptor;
    }
}

export function createParamDecorator(fn: (player, args) => Promise<any> | any){
    return () => (target: any, propertyKey: string, parameterIndex: number) => {
        const metadata = Reflect.getMetadata(DECORATOR_TYPES.PARAM, target.constructor) || [];
        metadata.push({propertyKey, parameterIndex, fn: fn});
        Reflect.defineMetadata(DECORATOR_TYPES.PARAM, metadata, target.constructor);
    }

}

export const CurrentPlayer = createParamDecorator((player, args) => {
    return player;
})

export const Data = createParamDecorator((player, args) => {
    return args;
})
