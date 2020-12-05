import { ServerConnectService } from './server-connect.service';
import { IObservableCanvas } from './../_model/iobservable-canvas';
import { Injectable } from '@angular/core';
import { convertUpdateArguments } from '@angular/compiler/src/compiler_util/expression_converter';
import { WSMessageArgs } from '../../../../whiteboard-server/src/iserver';

const PERIOD = 1000; // 1sec

@Injectable({
  providedIn: 'root'
})
export class CanvasObserverService {

  observed: Map<string, IObservableCanvas> = new Map();

  constructor(
    private serverConnect: ServerConnectService
  ) {
    setInterval(() => {this.capture(); }, PERIOD);
    this.serverConnect.receive().subscribe((data: WSMessageArgs) => {
      console.log('receive data:', JSON.stringify(data));
    });
  }

  public observe(id: string, canvas: IObservableCanvas): void {
    if (!this.observed.has(id)) {
      this.observed.set(id, canvas);
    }
  }

  public stopObserving(id: string): void {
    this.observed.delete(id);
  }

  private capture(): void {
    console.log('capture canvas image');
    this.observed.forEach((canvas, id) => {
      if (canvas.hasChanged) {
        const img = canvas.getImage();
        this.serverConnect.updateImage(img);
      }
    });
  }

}
