import { StartPageComponent } from './_components/start-page/start-page.component';
import { CanvasComponent } from './_components/canvas/canvas.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule, ExtraOptions } from '@angular/router';

const routes: Routes = [
  {path: 'canvas', component: CanvasComponent},
  {path: 'start', component: StartPageComponent},
  {path: '', component: StartPageComponent}
];

const options: ExtraOptions = {
  paramsInheritanceStrategy: 'always'
}

@NgModule({
  imports: [RouterModule.forRoot(routes, options)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
