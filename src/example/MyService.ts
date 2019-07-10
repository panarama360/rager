import {Service} from "typedi";
import {Player} from '../'

@Service()
export class MyService {
    editUserSession(player: Player){
        player.clientSession.hello = Math.random();
    }
}
