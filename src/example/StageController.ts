import {MpController, MpEnterStage, Data, MpLeaveStage, CurrentPlayer, Player} from "../";
import {MyStage} from "./MyStage";

@MpController({
    name: 'MY_STAGE'
})
export class StageController {

    @MpEnterStage()
    enter(@Data() data: any, @CurrentPlayer() player: Player<MyStage>){
        console.log('Enter Stage', data);
        console.log('Enter Player', player);
    }

    @MpLeaveStage()
    leave(@Data() data: any, @CurrentPlayer() player: Player<MyStage>){
        console.log('Leave Stage', data);
        console.log('Leave Player', player);
    }
}
