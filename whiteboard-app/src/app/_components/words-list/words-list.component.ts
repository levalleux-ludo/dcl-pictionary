import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-words-list',
  templateUrl: './words-list.component.html',
  styleUrls: ['./words-list.component.scss']
})
export class WordsListComponent implements OnInit {

  @Input()
  words = ['tata', 'titi'];

  constructor() { }

  ngOnInit(): void {
  }

}
