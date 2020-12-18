import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Button } from 'protractor';

export enum ePencil {
  thin = 'thin',
  medium = 'medium',
  thick = 'thick'
}

export enum eColor {
  black = 'black',
  red = 'red',
  blue = 'blue',
  green = 'green',
  yellow = 'yellow'
}

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss']
})
export class ToolbarComponent implements OnInit {

  _pencil: ePencil = ePencil.thin;
  _color: eColor = eColor.black;
  _eraser = false;
  constructor() { }

  @Output()
  pencilChanged = new EventEmitter();
  public get pencil(): ePencil|string {
    return this._pencil;
  }

  public set pencil(value: ePencil|string) {
    this._pencil = ( typeof value === 'string' ) ? ePencil[value] : value;
    this.pencilChanged.emit({value: this._pencil});
    if (this.eraser) {
      this.eraser = false;
    }
  }

  @Output()
  colorChanged = new EventEmitter();
  public get color(): eColor|string {
    return this._color;
  }

  public set color(value: eColor|string) {
    this._color = ( typeof value === 'string' ) ? eColor[value] : value;
    this.colorChanged.emit({value: this._color});
    if (this.eraser) {
      this.eraser = false;
    }
  }

  @Output()
  eraserChanged = new EventEmitter();
  public get eraser(): boolean {
    return this._eraser;
  }

  public set eraser(value: boolean) {
    this._eraser = value;
    this.eraserChanged.emit({value: this._eraser});
  }

  @Output()
  clear = new EventEmitter();

  ngOnInit(): void {
  }

  clearCanvas() {
    this.clear.emit({});
    if (this.eraser) {
      this.eraser = false;
    }
  }

}
