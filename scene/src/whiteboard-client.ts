import utils from "../node_modules/decentraland-ecs-utils/index"
import { eState, stateManager } from './StateManager';
import { getCurrentRealm } from "@decentraland/EnvironmentAPI";
import { getUserData  } from "@decentraland/Identity"
import { WSMessageArgs, eMessages, ImageUpdatedArgs, RoundStartedArgs, RoundFailedArgs, RoundCompletedArgs, RealmStatus } from '../../whiteboard-server/src/iserver';
import { getHTTPUrl, getWSUrl } from "./Utils";
import { WHITEBOARD_HTTP } from "./Constants";

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
    _iAmDrawing = false;

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
        if (!userData) {
          throw new Error('userData is not ready yet');
        }
        this.address = userData.userId;
      });
      await getWSUrl().then((url) => {
          // connect to ws server
          log('websocket url', url);
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
                  stateManager.setState(eState.GUESSING, {drawerName: args.drawer.name, timeoutSec: 0});
                }
                this._onRefreshImage.fireEvent(new WhiteBoardEvent(args.imageUrl));
              }
            }

            // if message is roundStarted
            if (data.message === eMessages.roundStarted) {
              const args: RoundStartedArgs = data.args as RoundStartedArgs;
              if (args.drawerAddress === this.address) {
                this._iAmDrawing = true;
                stateManager.setState(eState.DRAWING);
              } else {
                this._iAmDrawing = false;
                stateManager.setState(eState.GUESSING, {drawerName: args.drawerName, timeoutSec: args.timeoutSec});
              }
            }

            // if message is roundFailed
            if (data.message === eMessages.roundFailed) {
              const args: RoundFailedArgs = data.args as RoundFailedArgs;
              if (this._iAmDrawing) {
                this._iAmDrawing = false;
                stateManager.setState(eState.END_DRAWING, args);
              } else {
                this._iAmDrawing = false;
                stateManager.setState(eState.TIMEDOUT, args);
              }
            }

            // if message is roundCompleted
            if (data.message === eMessages.roundCompleted) {
              const args: RoundCompletedArgs = data.args as RoundCompletedArgs;
              if (this._iAmDrawing) {
                this._iAmDrawing = false;
                stateManager.setState(eState.END_DRAWING, args);
              } else if (args.winnerAddress === this.address) {
                this._iAmDrawing = false;
                stateManager.setState(eState.WINNER, args);
              } else {
                this._iAmDrawing = false;
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

    public async claimNFT(tokenId: string, signerAddress: string, signature: any) {
      const url = `${WHITEBOARD_HTTP}/claim/${tokenId}?signer=${signerAddress}`;
      return new Promise((resolve, reject) => {
        fetch(url, {
          body: JSON.stringify(signature),
          method: 'POST',
          headers: {
            "Content-Type": "application/json"
          }
        }).then((response) => {
          if (response.ok) {
            resolve();
          } else {
            reject(response.statusText);
          }
        }).catch(reject);
      })
    }

}

export const whiteboardClient = new WhiteBoardClient();
