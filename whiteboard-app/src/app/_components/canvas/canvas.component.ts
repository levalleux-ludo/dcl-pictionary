import { first } from 'rxjs/operators';
import { ServerConnectService } from './../../_services/server-connect.service';
import { DOCUMENT } from '@angular/common';
import { Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { v4 as uuid } from 'uuid';
import { IObservableCanvas } from './../../_model/iobservable-canvas';
import { CanvasObserverService } from './../../_services/canvas-observer.service';

export interface IPoint {
  x: number;
  y: number;
}

@Component({
  selector: 'app-canvas',
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.scss']
})
export class CanvasComponent implements OnInit, OnDestroy, IObservableCanvas {

  @ViewChild('canvas', {static: true})
  canvas: ElementRef;

  isActive = false;
  plots: IPoint[] = [];
  point: string;
  id;
  _hasChanged = false;
  words = [];

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private canvasObserver: CanvasObserverService,
    private serverConnect: ServerConnectService
  ) { }

  get hasChanged(): boolean {
    return this._hasChanged;
  }

  getImage(): string {
    this._hasChanged = false;
    if (this.canvas) {
      return (this.canvas.nativeElement as HTMLCanvasElement).toDataURL();
    }
    return undefined;
  }

  ngOnDestroy(): void {
    this.canvasObserver.stopObserving(this.id);
  }

  ngOnInit(): void {
    this.id = uuid();
    // Prevent scrolling when touching the canvas
    this.document.body.addEventListener('touchstart', (e) => {
      if (e.target === this.canvas.nativeElement) {
        e.preventDefault();
      }
    }, {capture: false, once: false, passive: false});
    this.document.body.addEventListener('touchend', (e) => {
      if (e.target === this.canvas.nativeElement) {
        e.preventDefault();
      }
    }, {capture: false, once: false, passive: false});
    this.document.body.addEventListener('touchmove', (e) => {
      if (e.target === this.canvas.nativeElement) {
        e.preventDefault();
      }
    }, {capture: false, once: false, passive: false});
    if (this.canvas) {
      this.initCanvasElement(this.canvas.nativeElement);
    } else {
      console.error('canvas element is not defined');
    }
    this.canvasObserver.observe(this.id, this);
    this.serverConnect.getWords().pipe(first()).subscribe((words) => {
      console.log('get words', words);
      this.words = words;
    })
  }

  initCanvasElement(htmlCanvas: HTMLCanvasElement): void {
    htmlCanvas.width = htmlCanvas.parentElement.clientWidth;
    htmlCanvas.height = htmlCanvas.parentElement.clientHeight - 100;
    const ctx = htmlCanvas.getContext('2d');
    htmlCanvas.addEventListener('mousedown', (e: MouseEvent ) => {this.startDraw(e); }, false);
    htmlCanvas.addEventListener('mousemove', (e: MouseEvent) => {this.draw(htmlCanvas, ctx, e); }, false);
    htmlCanvas.addEventListener('mouseup', (e: MouseEvent) => {this.endDraw(); }, false);
    htmlCanvas.addEventListener('mouseleave', (e: MouseEvent) => {this.endDraw(); }, false);

    // Set up touch events for mobile, etc
    htmlCanvas.addEventListener('touchstart', (e) => {
      const touch = e.touches[0];
      // console.log('TouchEvent', e);
      console.log('Touch', touch);
      // const mousePos = this.getTouchPos(htmlCanvas, e);
      // console.log('mousePos', mousePos);
      // console.log('Touch', touch);
      const mouseEvent = new MouseEvent('mousedown', {
        clientX: touch.clientX,
        clientY: touch.clientY
      });
      touch.target.dispatchEvent(mouseEvent);
    }, false);
    htmlCanvas.addEventListener('touchend', (e) => {
      const mouseEvent = new MouseEvent('mouseup', {});
      htmlCanvas.dispatchEvent(mouseEvent);
    }, false);
    htmlCanvas.addEventListener('touchmove', (e: TouchEvent) => {
      const touch = e.touches[0];
      // const mousePos = this.getTouchPos(htmlCanvas, e);
      const mouseEvent = new MouseEvent('mousemove', {
        clientX: touch.clientX,
        clientY: touch.clientY
      });
      touch.target.dispatchEvent(mouseEvent);
    }, false);
  }

  startDraw(e: MouseEvent): void {
    this.isActive = true;
    console.log('MouseEvent', e);
    this.point = `clientX: ${e.clientX}, clientY: ${e.clientY}, offsetX: ${e.offsetX}, offsetY: ${e.offsetY}`;
  }

  endDraw(): void {
    this.isActive = false;
    // empty the array
    this.plots = [];
  }

  draw(htmlCanvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, e: MouseEvent): void {
    if (!this.isActive) { return; }
    this._hasChanged = true;
    // cross-browser canvas coordinates
    const mousePos = this.getTouchPos(htmlCanvas, e);

    this.plots.push(mousePos);

    this.drawOnCanvas(ctx, this.plots);
  }

  drawOnCanvas(ctx: CanvasRenderingContext2D, plots: IPoint[]): void {
    ctx.beginPath();
    ctx.moveTo(plots[0].x, plots[0].y);
    for (let i = 1; i < plots.length; i++) {
      ctx.lineTo(plots[i].x, plots[i].y);
    }
    ctx.stroke();
  }

  // Get the position of a touch relative to the canvas
  getTouchPos(htmlCanvas: HTMLCanvasElement, event: MouseEvent): IPoint {
    const rect = htmlCanvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
  }
}
