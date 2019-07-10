import {Player, Stage} from "./Player";
import {DECORATOR_TYPES} from "./Decorators";
import {Container} from "typedi";
import "reflect-metadata";
import {createDeepProxy} from "./deepProxy";

export async function build(controllers: Function[]) {
    const metaControllers = controllers.map(value => {
        return {
            constructor: value,
            instance: Container.get(value),
            middlewares: Reflect.getMetadata(DECORATOR_TYPES.MIDDLEWARES, value) || [],
            controller: Reflect.getMetadata(DECORATOR_TYPES.CONTROLLER, value),
            events: Reflect.getMetadata(DECORATOR_TYPES.EVENT, value) || [],
            commands: Reflect.getMetadata(DECORATOR_TYPES.COMMAND, value) || [],
            success: Reflect.getMetadata(DECORATOR_TYPES.SUCCESS, value) || [],
            error: Reflect.getMetadata(DECORATOR_TYPES.ERROR, value) || [],
            enterStage: Reflect.getMetadata(DECORATOR_TYPES.ENTER_STAGE, value) || [],
            leaveStage: Reflect.getMetadata(DECORATOR_TYPES.LEAVE_STAGE, value) || [],
            params: Reflect.getMetadata(DECORATOR_TYPES.PARAM, value) || [],
        }
    });
    mp.events.add("playerJoin", (player: Player) => {
        player.stage = new Stage();
        player.stage.name = 'DEFAULT_MAIN_STAGE';
        player.stage.session = {};

        player.clientSession = createDeepProxy({}, {
            set(target, path, value, receiver) {
                if(typeof value == 'function')
                    return console.log('Cannot be a function');
                player.setVariable('session', target);
                player.call('change_session', [JSON.stringify({
                    path,
                    value: typeof value === 'object'? JSON.stringify(value):value
                })])
            },
        })
        player.setStage = (name, data?) => {
            let find;
            if(typeof name == 'function') {
                find = metaControllers.find(val => val.constructor == name);
                if(!find)
                    return console.error(`[Error] Controller '${name.name}' not found!`);
                name = find.controller.name;
            }
            else
                find = metaControllers.find(val => val.controller.name == name);
            console.log('Find: ', find);
            player.controllerMeta = find;
            if (!find)
                return console.error('[ERROR] SetStage Error, controller not found: ' + name);
            find.enterStage.forEach(async (value) => {
                const controllerMiddleware = find.middlewares.filter(val => !val.propertyKey);
                const {methodMiddleware, error, success, params} = parseMetadata(find, value);
                player.stage = new Stage<any>()
                player.stage.name = name;
                player.stage.session = data;
                await callMethod(methodMiddleware, error, success, params, value, controllerMiddleware, find, player, data);
            })
            player.call('enter_stage', [JSON.stringify({stage: find.controller.name, data})]);
        };

        player.leaveStage = (data?) => {
            console.log('player', player.stage);
            if (player.stage.name == 'DEFAULT_MAIN_STAGE')
                return console.error('[ERROR] LeaveStage Error, player not exist stage');
            if(!player.controllerMeta)
                return console.error('[ERROR] LeaveStage Error, controllerMetadata is undefined');

            player.controllerMeta.leaveStage.forEach(async (value) => {
                const controllerMiddleware = player.controllerMeta.middlewares.filter(val => !val.propertyKey);
                const {methodMiddleware, error, success, params} = parseMetadata(player.controllerMeta, value);
                player.stage = new Stage<any>()
                player.stage.name = 'DEFAULT_MAIN_STAGE';
                player.stage.session = data;

                await callMethod(methodMiddleware, error, success, params, value, controllerMiddleware, player.controllerMeta, player, data);
            })
            player.controllerMeta = undefined;
            player.call('leave_stage', [JSON.stringify({})]);
        };
    });

    metaControllers.forEach(controller => {
        const controllerMiddleware = controller.middlewares.filter(val => !val.propertyKey);

        controller.events.forEach(metaEvent => {
            const {methodMiddleware, error, success, params} = parseMetadata(controller, metaEvent);
            mp.events.add(metaEvent.name, async (player: Player, ...args) => {
                await callMethod(methodMiddleware, error, success, params, metaEvent, controllerMiddleware, controller, player, args);
            })
        });

        controller.commands.forEach(metaComand => {
            const {methodMiddleware, error, success, params} = parseMetadata(controller, metaComand);
            mp.events.addCommand(metaComand.name, async (player: Player, ...args) => {
                await callMethod(methodMiddleware, error, success, params, metaComand, controllerMiddleware, controller, player, args);
            })
        })
    })
}

function parseMetadata(controllerMeta, methodMetadata) {
    return {
        methodMiddleware: controllerMeta.middlewares.filter(val => val.propertyKey === methodMetadata.propertyKey),
        error: controllerMeta.error.filter(val => val.propertyKey === methodMetadata.propertyKey),
        success: controllerMeta.success.filter(val => val.propertyKey === methodMetadata.propertyKey),
        params: controllerMeta.params.filter(val => val.propertyKey === methodMetadata.propertyKey).sort((a, b) => a.parameterIndex - b.parameterIndex).map(val => val.fn),
    }
}

async function callMethod(methodMiddleware, error, success, params, methodMetadata, controllerMiddleware, controller, player, args) {
    if (player.controllerMeta && player.controllerMeta.controller.onlyThis && player.controllerMeta.controller.name != controller.controller.name && !controller.controller.global) return;
    try {

        for (const middle of [...controllerMiddleware, ...methodMiddleware])
            await middle.use(player, args);
        const injectParams = [];
        for (const param of params) {
            try {
                injectParams.push(param(player, args));
            } catch (e) {
                console.log('[ERROR] Error Inject Parameter', e.message);
            }
        }
        const result = await controller.instance[methodMetadata.propertyKey](...injectParams);
        if (success.length)
            success.forEach(val => {
                if (typeof result == 'object')
                    player.call(val.event, [JSON.stringify(result)]);
                else
                    player.call(val.event, [result]);
            })
    } catch (e) {
        console.error('[Error] ', e);
        if (error.length)
            error.forEach(val => {
                if (e.args) {
                    if (typeof e.args == 'object')
                        player.call(val.event, [JSON.stringify(e.args)]);
                    else
                        player.call(val.event, [e.args]);
                } else {
                    player.call(val.event, [e.message]);
                }
            })
    }
}
