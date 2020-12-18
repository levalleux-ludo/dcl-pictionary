import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-words-list',
  templateUrl: './words-list.component.html',
  styleUrls: ['./words-list.component.scss']
})
export class WordsListComponent implements OnInit {

  @Input()
  words = ['tata', 'titi'];

  @Output()
  changeWords = new EventEmitter();

  constructor() { }

  ngOnInit(): void {
  }

}
