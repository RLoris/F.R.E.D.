import { Component, OnInit, Input } from '@angular/core';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-relax-and-breathe',
  templateUrl: './relax-and-breathe.component.html',
  styleUrls: ['./relax-and-breathe.component.css']
})
export class RelaxAndBreatheComponent implements OnInit {

  displayPlaylist = true;

  constructor() { }

  ngOnInit() {
  }

  togglePlaylist() {
    this.displayPlaylist = !this.displayPlaylist;
  }

}
