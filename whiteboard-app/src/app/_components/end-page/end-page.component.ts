import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { first } from 'rxjs/operators';

@Component({
  selector: 'app-end-page',
  templateUrl: './end-page.component.html',
  styleUrls: ['./end-page.component.scss']
})
export class EndPageComponent implements OnInit {

  winner: string;
  word: string;

  constructor(
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.route.queryParams.pipe(first()).subscribe((params: any) => {
      console.log('routeParams', params);
      if (params.winner === undefined) {
        throw new Error('query params winner must be specified');
      }
      if (params.word === undefined) {
        throw new Error('query params word must be specified');
      }
      this.winner = decodeURIComponent(params.winner);
      this.word = decodeURIComponent(params.word);
    })
  }

  close() {
    setTimeout(function(){var ww = window.open('', '_self'); ww.close(); }, 1000);
  }

}
