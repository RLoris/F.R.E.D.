import { Component, OnInit, Input } from '@angular/core';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-chill-music-video',
  templateUrl: './chill-music-video.component.html',
  styleUrls: ['./chill-music-video.component.css']
})
export class ChillMusicVideoComponent implements OnInit {

  displayPlaylist = true;

  constructor() { }

  ngOnInit() {
  }

  togglePlaylist() {
    this.displayPlaylist = !this.displayPlaylist;
  }
}
