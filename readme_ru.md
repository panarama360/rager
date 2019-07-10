# Rager

Это простой фреймворк для [RAGE MP](https://rage.mp) основанный на typescript и decorators

## Установка
`npm i rager --save`

## Пример
Создаем контроллер

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

Создаем сервис по необходимости, который будет инжектиться в контроллер (для этого придется установить зависимость `npm install typedi --save`)

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

Билдим
```typescript
import {build} from 'rager'
import {Controller} from "./Controller";
build([Controller])

```
###Создание декоратора для параметра
Функция должена быть синхронной!!
```typescript
export const MyDecoratorPlayer = createParamDecorator((player, args) => {
    return player;
})
```

