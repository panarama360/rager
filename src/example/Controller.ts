import {MyService} from "./MyService";
import {MpController, MpCommand, CurrentPlayer, Player, MpEvent, MpOnSuccess, MpOnError, MpMiddleware} from "../";
import {StageController} from "./StageController";
import {MyDecoratorPlayer} from "./decorator";

@MpController()
export class Controller {
    constructor(private service: MyService){}

    @MpEvent('playerJoin')
    startGame(@CurrentPlayer()player: Player){
        player.health = 100;
        player.spawn(player.position);
    }
    @MpCommand('enterStage')
    callCommand(@CurrentPlayer() player: Player){
        player.setStage("MY_STAGE", {hello: 123});
    }
    @MpCommand('leaveStage')
    callCommand2(@CurrentPlayer() player: Player){
        player.leaveStage('Hello');
    }

    @MpCommand('setClientSession')
    callCommand3(@CurrentPlayer() player: Player){
        this.service.editUserSession(player);
    }

    @MpCommand('decorator')
    myDecorator(@MyDecoratorPlayer() player: Player){
        this.service.editUserSession(player);
    }

    @MpOnError('error_event')
    @MpCommand('error')
    error(){
        throw new Error('Test')
    }

    @MpOnSuccess('success_event')
    @MpCommand('success')
    success(){
        return 'Success Message';
    }

    @MpMiddleware((player, args) => {
        if(!player.session.admin) throw new Error('Only Admins');
    })
    @MpOnError('error_event')
    @MpOnSuccess('admins_list')
    @MpCommand('admins')
    middleware(){
        return {
            admins: ['panarama360']
        }
    }
}
