import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
// import { RxStompService } from '@stomp/ng2-stompjs';
// import { RxStompState } from '@stomp/rx-stomp';
import { BehaviorSubject, Observable, Observer, Subject } from 'rxjs';
import { filter, first, switchMap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { WSMessageArgs, eMessages, UpdateImageArgs, StartDrawingArgs } from '../../../../whiteboard-server/src/iserver';

// const REALM_NAME = 'localhost-stub';
const WS = 'ws://192.168.1.11:13370';
const HTTP = 'http://192.168.1.11:80';

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
  private realm = 'unknown_realm';
  private userAddress = 'unknown_address';

  constructor(
    // private rxStompService: RxStompService
    private route: ActivatedRoute,
    private http: HttpClient
  ) {
    this.state = new BehaviorSubject<SocketClientState>(SocketClientState.ATTEMPTING);
    // this.rxStompService.connectionState$.subscribe(state => {
    //   // state is an Enum (Integer), StompState[state] is the corresponding string
    //   console.log(RxStompState[state]);
    //   if (state === RxStompState.OPEN) {
    //     this.state.next(SocketClientState.CONNECTED);
    //   }
    // });
    this.route.queryParams.pipe(first()).subscribe((params) => {
      console.log('routeParams', params);
      if (params.realm === undefined) {
        throw new Error('query params realm must be specified');
      }
      if (params.userId === undefined) {
        throw new Error('query params userId must be specified');
      }
      this.realm = params.realm;
      this.userAddress = params.userId;
      this.ws = new WebSocket(`${WS}/${this.realm}?userId=${this.userAddress}`);
      // this.ws = new WebSocket(`${WS}/${this.realm}?user=${this.userAddress}`);
      this.connect = new Observable((obs: Observer<WebSocket>) => {
        this.ws.onopen = () => {
          this.state.next(SocketClientState.CONNECTED);
        }
        this.ws.onmessage = obs.next.bind(obs);
        this.ws.onerror = obs.error.bind(obs);
        this.ws.onclose = obs.complete.bind(obs);
        return this.ws.close.bind(this.ws);
      });
    })

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

  private send(payload: WSMessageArgs): void {
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

  public updateImage(img: string): void {
    const args: UpdateImageArgs = {image: img};
    this.send({realm: `${this.realm}`, message: eMessages.updateImage, args});
  }

  public startDrawing(): void {
    const args: StartDrawingArgs = {drawerAddress: this.userAddress};
    this.send({realm: `${this.realm}`, message: eMessages.startDrawing, args});
  }

  public getWords(): Observable<string[]> {
    return this.http.get<string[]>(
      `${HTTP}/${this.realm}/words`,
      { params: {
        drawer: this.userAddress
      }});
  }

}
