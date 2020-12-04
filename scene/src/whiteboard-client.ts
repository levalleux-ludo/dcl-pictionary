import { getCurrentRealm } from "@decentraland/EnvironmentAPI";

const WS = 'ws://127.0.0.1:13370/broadcast';


@EventConstructor()
export class WhiteBoardEvent {
  constructor(public payload: any) {
  }
}

export class WhiteBoardClient {
    isReady = false;
    socket;
    _onReady: EventManager = new EventManager();
    _onRefreshImage: EventManager = new EventManager();
    constructor() {
        getCurrentRealm().then((realm) => {
            log(`You are in the realm: `, realm.displayName)
            // connect to ws server
            this.socket = new WebSocket(`${WS}/${realm.displayName}`)
            this.socket.onopen = () => {
                this.isReady = true;
                this._onReady.fireEvent(new WhiteBoardEvent(this.isReady));
            };
            this.socket.onmessage = (e) => {this.onmessage(e);};
        })
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
            const parsed = JSON.parse(event.data)
            log(parsed)
            if (parsed.image) {
              // TODO: get new image and refresh scene
              log('received a new image')
              this._onRefreshImage.fireEvent(new WhiteBoardEvent(parsed.image))
            }
          } catch (error) {
            log("ERROR:" + error)
          }
    }

}
