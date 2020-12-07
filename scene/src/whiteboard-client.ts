import utils from "../node_modules/decentraland-ecs-utils/index"
import { eState, stateManager } from './StateManager';
import { getCurrentRealm } from "@decentraland/EnvironmentAPI";
import { getUserData  } from "@decentraland/Identity"
import { WSMessageArgs, eMessages, ImageUpdatedArgs, RoundStartedArgs, RoundFailedArgs, RoundCompletedArgs, RealmStatus } from '../../whiteboard-server/src/iserver';
import { getHTTPUrl, getWSUrl } from "./Utils";

// const WS = 'ws://127.0.0.1:13370';


@EventConstructor()
export class WhiteBoardEvent {
  constructor(public payload: any) {
  }
}

class WhiteBoardClient {
    isReady = false;
    socket;
    address;
    _onReady: EventManager = new EventManager();
    _onRefreshImage: EventManager = new EventManager();

    constructor() {
      let timer = new Entity();
      timer.addComponent(new utils.Interval(2000,()=>{
        try {
          this.initialize().then(() => {
            engine.removeEntity(timer);
          })
        } catch (e) {
          log('not ready yet');
        }
      }));
      engine.addEntity(timer);

    }

    public async initialize() {
      await getUserData ().then((userData) => {
        this.address = userData.userId;
      });
      await getWSUrl().then((url) => {
          // connect to ws server
          this.socket = new WebSocket(url);
      // getUserData ().then((userData) => {
      //   getCurrentRealm().then((realm) => {
      //     log(`You are in the realm: `, realm.displayName)
      //     // connect to ws server
      //     this.socket = new WebSocket(`${WS}/${realm.displayName}?userId=${userData.userId}&userName=${userData.displayName}`)
          
          this.socket.onopen = () => {
              this.isReady = true;
              this._onReady.fireEvent(new WhiteBoardEvent(this.isReady));
          };
          this.socket.onmessage = (e) => {this.onmessage(e);};
        })
      // })
    }

    public get onReady(): EventManager {
        return this._onReady;
    }

    public get onRefreshImage(): EventManager {
        return this._onRefreshImage;
    }

    private onmessage(event: MessageEvent) {
        try {
            log(event)
            const data: WSMessageArgs = JSON.parse(event.data) as WSMessageArgs;

            // if message is realmStatus
            if (data.message === eMessages.realmStatus) {
              const args: RealmStatus = data.args as RealmStatus;
              if (args.drawer) {
                if (args.drawer.address === this.address) {
                  stateManager.setState(eState.DRAWING);
                } else {
                  stateManager.setState(eState.GUESSING, {drawerName: args.drawer.name});
                }
                this._onRefreshImage.fireEvent(new WhiteBoardEvent(args.imageUrl));
              }
            }

            // if message is roundStarted
            if (data.message === eMessages.roundStarted) {
              const args: RoundStartedArgs = data.args as RoundStartedArgs;
              if (args.drawerAddress === this.address) {
                stateManager.setState(eState.DRAWING);
              } else {
                stateManager.setState(eState.GUESSING, {drawerName: args.drawerName});
              }
            }

            // if message is roundFailed
            if (data.message === eMessages.roundFailed) {
              const args: RoundFailedArgs = data.args as RoundFailedArgs;
              stateManager.setState(eState.TIMEDOUT, args);
            }

            // if message is roundCompleted
            if (data.message === eMessages.roundCompleted) {
              const args: RoundCompletedArgs = data.args as RoundCompletedArgs;
              if (args.winnerAddress === this.address) {
                stateManager.setState(eState.WINNER, args);
              } else {
                stateManager.setState(eState.OTHER_WINNER, args);
              }
            }

            // if message is imageUpdated
            if (data.message === eMessages.imageUpdated) {
            // log(parsed)
            // if (parsed.image) {
            //   // TODO: get new image and refresh scene
              log('received a new image')
              const args: ImageUpdatedArgs = data.args as ImageUpdatedArgs;
              this._onRefreshImage.fireEvent(new WhiteBoardEvent(args.imageUrl))
            }
          } catch (error) {
            log("ERROR:" + error)
          }
    }

    public async submitWord(word: string, checkOnly = false): Promise<{word: string, checkResult: boolean}> {
      const url = await getHTTPUrl(checkOnly ? 'check' : 'submit') + `&word=${word}`;
      return new Promise((resolve, reject) => {
        fetch(url).then((response) => {
          if (response.ok) {
            response.json().then((data) => {
              log('check result:', data)
              resolve(data);
            })
          }
        })
      });
    }

}

export const whiteboardClient = new WhiteBoardClient();
