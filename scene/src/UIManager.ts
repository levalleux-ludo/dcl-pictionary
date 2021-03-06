import utils from "../node_modules/decentraland-ecs-utils/index"
import { UITimedOut } from './UITimedOut';
import { UISubmit } from './UISubmit';
import { StateEvent, stateManager, eState } from './StateManager';
import { UICongrats } from './UICongrats';
import { UIOtherWins } from './UIOtherWins';

enum UIs {
    UISubmit = 0,
    UICongrats,
    UITimedOut,
    UIOtherWins
}

export interface IUI {
    setVisible(visible: boolean);
}

export class UIManager {

    uis: {[key: number]: IUI} = {};

    constructor(canvas: UICanvas) {
        this.setUI(UIs.UISubmit, new UISubmit(canvas));
        this.setUI(UIs.UITimedOut, new UITimedOut(canvas));
        this.setUI(UIs.UIOtherWins, new UIOtherWins(canvas));
        this.setUI(UIs.UICongrats, new UICongrats(canvas));

        stateManager.onChange.addListener(StateEvent, this, (event) => {
            log('UIManager on state change', event.newState);
            
            switch (event.newState.value) {
                case eState.NO_DRAWER: {
                    // // DEBUG
                    // this.show(UIs.UICongrats);
                    break;
                }
                case eState.DRAWER: {
                    break;
                }
                case eState.DRAWING: {
                    break;
                }
                case eState.GUESSING: {
                    (this.uis[UIs.UISubmit] as UISubmit).setDrawerName(event.newState.args.drawerName)
                    this.buildTimer(event.newState.args.timeoutSec)
                    this.show(UIs.UISubmit);
                    break;
                }
                case eState.TIMEDOUT: {
                    this.show(UIs.UITimedOut);
                    break;
                }
                case eState.WINNER: {
                    (this.uis[UIs.UICongrats] as UICongrats).setTokenId(event.newState.args.tokenId)
                    this.show(UIs.UICongrats);
                    break;
                }
                case eState.END_DRAWING: {
                    (this.uis[UIs.UIOtherWins] as UIOtherWins).setNobodyWin()
                    this.show(UIs.UIOtherWins);
                    break;
                }
                case eState.OTHER_WINNER: {
                    (this.uis[UIs.UIOtherWins] as UIOtherWins).setWinnerName(event.newState.args.winnerName, event.newState.args.word)
                    this.show(UIs.UIOtherWins);
                    break;
                }
                default: {
                    break;
                }
            }
        })
    }

    setUI(type: UIs, ui: IUI) {
        this.uis[type] = ui;
    }

    hideAll(except?: UIs) {
        for(let type in this.uis) {
            if (!except || (except.toString() !== type)) {
                this.uis[type].setVisible(false);
            }
        }
    }

    show(type: UIs) {
        this.hideAll(type);
        const ui = this.uis[type];
        if (ui) {
            ui.setVisible(true);
        }
    }

    setTimeout(value: number) {
        const uiSubmit = this.uis[UIs.UISubmit] as UISubmit;
        if (uiSubmit) {
            uiSubmit.setTimeout(value);
        }
    }

    buildTimer(timeOut: number) {
        if (timeOut > 0) {
            let timer = new Entity();
            let max = timeOut;
            timer.addComponent(new utils.Interval(1000,()=>{
                timeOut -= 1;
                if (timeOut <= 0) {
                    engine.removeEntity(timer);
                }
                this.setTimeout(timeOut / max);
            }));
            engine.addEntity(timer);
        }
    }

}