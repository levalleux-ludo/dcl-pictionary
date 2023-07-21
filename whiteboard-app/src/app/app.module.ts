import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CanvasComponent } from './_components/canvas/canvas.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { InjectableRxStompConfig, RxStompService, rxStompServiceFactory } from '@stomp/ng2-stompjs';
import { myRxStompConfig } from './my-rx-stomp.config';
import { StartPageComponent } from './_components/start-page/start-page.component';
import { WordsListComponent } from './_components/words-list/words-list.component';
import { HttpClientModule } from '@angular/common/http';
import { ToolbarComponent } from './_components/toolbar/toolbar.component';
import {MatMenuModule} from '@angular/material/menu';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import { EndPageComponent } from './_components/end-page/end-page.component';
import { TimeoutPageComponent } from './_components/timeout-page/timeout-page.component';
import {MatProgressBarModule} from '@angular/material/progress-bar';

@NgModule({
  declarations: [
    AppComponent,
    CanvasComponent,
    StartPageComponent,
    WordsListComponent,
    ToolbarComponent,
    EndPageComponent,
    TimeoutPageComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    MatMenuModule,
    MatIconModule,
    MatButtonModule,
    MatProgressBarModule
  ],
  providers: [
    // {
    //   provide: InjectableRxStompConfig,
    //   useValue: myRxStompConfig,
    // },
    // {
    //   provide: RxStompService,
    //   useFactory: rxStompServiceFactory,
    //   deps: [InjectableRxStompConfig],
    // },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
