import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-relax-and-breathe',
  templateUrl: './relax-and-breathe.component.html',
  styleUrls: ['./relax-and-breathe.component.css']
})
export class RelaxAndBreatheComponent implements OnInit {

  displayPlaylist = false;

  constructor() { }

  ngOnInit() {
  }

  togglePlaylist() {
    this.displayPlaylist = !this.displayPlaylist;
  }

}
