import {createParamDecorator} from "../Decorators";

export const MyDecoratorPlayer = createParamDecorator((player, args) => {

    return player;
})
