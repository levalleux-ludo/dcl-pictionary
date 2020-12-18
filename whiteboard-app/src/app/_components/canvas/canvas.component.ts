import { ePencil, eColor, ToolbarComponent } from './../toolbar/toolbar.component';
import { first, timeout } from 'rxjs/operators';
import { ServerConnectService } from './../../_services/server-connect.service';
import { DOCUMENT } from '@angular/common';
import { AfterViewInit, Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { v4 as uuid } from 'uuid';
import { IObservableCanvas } from './../../_model/iobservable-canvas';
import { CanvasObserverService } from './../../_services/canvas-observer.service';
import { RoundCompletedArgs, RoundFailedArgs, RoundStartedArgs } from '../../../../../whiteboard-server/src/iserver';
import { Router } from '@angular/router';
import { fromEvent, Observable, Subscription } from 'rxjs';

export interface IPoint {
  x: number;
  y: number;
}

const COLORS = {
  black: 'rgba(0,0,0,1)',
  red: 'rgba(153,0,0,1)',
  blue: 'rgba(0,0,153,1)',
  green: 'rgba(0,153,0,1)',
  yellow: 'rgba(255,255,0,1)',
  white: 'rgba(255,255,255,1)'
};

const PENCILS = {
  thin: 2,
  medium: 8,
  thick: 16,
  eraser: 24
};

@Component({
  selector: 'app-canvas',
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.scss']
})
export class CanvasComponent implements OnInit, OnDestroy, IObservableCanvas, AfterViewInit {

  @ViewChild('canvas', {static: true})
  canvas: ElementRef;

  @ViewChild('toolbox', {static: true})
  toolbox: ToolbarComponent;

  isActive = false;
  plots: IPoint[] = [];
  point: string;
  id;
  _hasChanged = false;
  words = ['unlongmotquiprendelaplace','tata','titi','tutusuperlongmotqui'];
  color;
  pencil;
  eraser;
  timeoutMaxSec = 0;
  timeoutSec = 0;
  timer;
  resizeObservable$: Observable<Event>;
  resizeSubscription$: Subscription;


  constructor(
    @Inject(DOCUMENT) private document: Document,
    private canvasObserver: CanvasObserverService,
    private serverConnect: ServerConnectService,
    private router: Router
  ) { }
  ngAfterViewInit(): void {
    this.color = eColor[this.toolbox.color];
    this.pencil = ePencil[this.toolbox.pencil];
    this.eraser = this.toolbox.eraser;
    this.resizeCanvas(this.canvas.nativeElement);
    this.initCanvasElement(this.canvas.nativeElement);
    this.serverConnect.roundCompleted.pipe(first()).subscribe((args: RoundCompletedArgs) => {
      console.log('catch event roundCompleted')
      this.router.navigate(['/end'],  { queryParams: {winner: args.winnerName, word: args.word}});
    });
    this.serverConnect.roundFailed.pipe(first()).subscribe((args: RoundFailedArgs) => {
      console.log('catch event roundFailed')
      this.router.navigate(['/timeout'],  { queryParams: {}});
    });
    this.serverConnect.roundStarted.pipe(first()).subscribe((args: RoundStartedArgs) => {
      console.log('catch event roundStarted')
      this.timeoutMaxSec = Math.floor(args.timeoutSec);
      this.timeoutSec = this.timeoutMaxSec;
      if (this.timer) {
        clearInterval(this.timer);
      }
      this.timer = setInterval(() => {
        this.timeoutSec -= 1;
        if (this.timeoutSec <= 0) {
          this.timeoutSec = 0;
          clearInterval(this.timer);
          this.timer = undefined;
        }
      }, 1000)
    });
    this.resizeSubscription$ = this.resizeObservable$.subscribe(evt => {
      console.log('resize', evt);
      // this.resizeCanvas(this.canvas.nativeElement);
    });
    setTimeout(() => {
      this.resizeCanvas(this.canvas.nativeElement);
    }, 500);

  }

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
    this.resizeSubscription$.unsubscribe();
    this.canvasObserver.stopObserving(this.id);
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = undefined;
    }
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
    // if (this.canvas) {
    //   this.initCanvasElement(this.canvas.nativeElement);
    // } else {
    //   console.error('canvas element is not defined');
    // }
    this.getWords();
    this.canvasObserver.observe(this.id, this);
    this.resizeObservable$ = fromEvent(window, 'resize');
  }

  getWords() {
    this.serverConnect.getWords().pipe(first()).subscribe((words) => {
      console.log('get words', words);
      this.words = words;
    })
  }

  clearCanvasElement(htmlCanvas: HTMLCanvasElement): void {
    const ctx = htmlCanvas.getContext('2d');
    this.endDraw();
    ctx.fillStyle = COLORS.white;
    ctx.fillRect(0,0,ctx.canvas.width, ctx.canvas.height);
  }

  resizeCanvas(htmlCanvas: HTMLCanvasElement) {
    htmlCanvas.width = htmlCanvas.parentElement.clientWidth - 4;
    htmlCanvas.height = htmlCanvas.parentElement.clientHeight - 4;
    this.clearCanvasElement(htmlCanvas);
  }

  initCanvasElement(htmlCanvas: HTMLCanvasElement): void {
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
    ctx.strokeStyle = (this.eraser) ? COLORS.white : COLORS[this.color];
    ctx.lineWidth = (this.eraser) ? PENCILS.eraser : PENCILS[this.pencil];
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

  clear() {
    this.clearCanvasElement(this.canvas.nativeElement);
    // if (this.eraser) {
    //   this.toolbox.eraser = false;
    // }
  }

  setColor() {

  }
}
