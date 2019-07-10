export class Stage<S> {
    name: string;
    session?: S;
}
export interface Player<S = any> extends PlayerMp {
    stage?: Stage<S>;
    session: any;
    controllerMeta?: any;
    clientSession: any;
    setStage<D>(nameStage: string, data?: D): void;
    setStage<D>(classController: Function, data?: D): void;
    leaveStage<D>(data?: D): void;
}
