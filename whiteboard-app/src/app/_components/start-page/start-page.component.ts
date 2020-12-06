import { first } from 'rxjs/operators';
import { ServerConnectService } from './../../_services/server-connect.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-start-page',
  templateUrl: './start-page.component.html',
  styleUrls: ['./start-page.component.scss']
})
export class StartPageComponent implements OnInit {

  constructor(
    private serverConnectService: ServerConnectService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.serverConnectService.receive().subscribe(() => {

    })
  }

  start(): void {
    this.serverConnectService.startDrawing();
    this.router.navigate(['/canvas'],  { queryParamsHandling: 'preserve'});
  }

}
