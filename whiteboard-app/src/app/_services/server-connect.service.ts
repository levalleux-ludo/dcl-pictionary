import { Injectable, OnDestroy } from '@angular/core';
// import { RxStompService } from '@stomp/ng2-stompjs';
// import { RxStompState } from '@stomp/rx-stomp';
import { BehaviorSubject, Observable, Observer, Subject } from 'rxjs';
import { filter, first, switchMap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

const REALM_NAME = 'localhost-stub';
const WS = 'ws://127.0.0.1:13370/broadcast';

export enum SocketClientState {
  ATTEMPTING, CONNECTED
}

@Injectable({
  providedIn: 'root'
})
export class ServerConnectService implements OnDestroy {
  private state: BehaviorSubject<SocketClientState>;
  private subject: Subject<MessageEvent>;
  private bs: BehaviorSubject<MessageEvent>;
  private ws: WebSocket;
  private connect: Observable<WebSocket>;

  constructor(
    // private rxStompService: RxStompService
  ) {
    this.state = new BehaviorSubject<SocketClientState>(SocketClientState.ATTEMPTING);
    this.ws = new WebSocket(`${WS}/${REALM_NAME}`);
    this.connect = new Observable((obs: Observer<WebSocket>) => {
      this.ws.onopen = () => {
        this.state.next(SocketClientState.CONNECTED);
      }
      this.ws.onmessage = obs.next.bind(obs);
      this.ws.onerror = obs.error.bind(obs);
      this.ws.onclose = obs.complete.bind(obs);
      return this.ws.close.bind(this.ws);
    });
    // this.rxStompService.connectionState$.subscribe(state => {
    //   // state is an Enum (Integer), StompState[state] is the corresponding string
    //   console.log(RxStompState[state]);
    //   if (state === RxStompState.OPEN) {
    //     this.state.next(SocketClientState.CONNECTED);
    //   }
    // });

  }

  ngOnDestroy(): void {
    // this.connect().pipe(first()).subscribe(inst => inst.disconnect(null));
  }

  // private create(url): Observable<MessageEvent> {
  //   const

  //   const observable = new Observable((obs: Observer<MessageEvent>) => {
  //     ws.onmessage = obs.next.bind(obs);
  //     ws.onerror = obs.error.bind(obs);
  //     ws.onclose = obs.complete.bind(obs);
  //     return ws.close.bind(ws);
  //   });
  //   const observer = {
  //     next: (data: any) => {
  //       if (ws.readyState === WebSocket.OPEN) {
  //         ws.send(JSON.stringify(data));
  //       }
  //     }
  //   };
  //   return new Subject(observer, observable);
  // }

  // private connect(): Subject<MessageEvent> {
  //   if (!this.subject) {
  //     this.subject = this.create(`${WS}`);
  //     console.log("Successfully connected: " + url);
  //   }
  //   return this.subject;
  // }

  public receive(): Observable<any> {
    return this.connect;
  }

  private send(topic: string, payload: any): void {
    this.state
      .pipe(first())
      .subscribe(state => {
        if (state === SocketClientState.CONNECTED) {
          console.log('sending', payload);
          this.ws.send(JSON.stringify(payload));
        }
      });
    // this.rxStompService.publish({
    //   destination: 'topic',
    //   body: JSON.stringify(payload)
    // });
  }

  public push(id: string, img: string): void {
    this.send('image', { id, image: img });
  }

}
