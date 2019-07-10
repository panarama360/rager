# Rager

This is a simple framework for [RAGE MP](https://rage.mp) based on typescript and decorators.

## Install
`npm i rager --save`

## Example
Create a controller

```typescript
import {MyService} from "./MyService";
import {MpController, MpCommand, CurrentPlayer, Player, MpEvent} from "rager";

@MpController()
export class Controller {
    constructor(private service: MyService){}

    @MpEvent('playerJoin')
    startGame(@CurrentPlayer()player: Player){
        player.health = 100;
    }
    @MpCommand('command1')
    callCommand(@CurrentPlayer() player: Player){
        this.service.editUserSession(player);
    }
}
```

Create a service as needed, which will be injected into the controller (for this, you will have to set the dependency `npm install typedi --save`
```typescript
import {Service} from "typedi";
import {Player} from 'rager'

@Service()
export class MyService {
    editUserSession(player: Player){
        player.clientSession.hello = Math.random();
    }
}

```

Build
```typescript
import {build} from 'rager'
import {Controller} from "./Controller";
build([Controller])

```
### Creating a decorator for a parameter
The function must be synchronous !!
```typescript
export const MyDecoratorPlayer = createParamDecorator((player, args) => {
    return player;
})
```

