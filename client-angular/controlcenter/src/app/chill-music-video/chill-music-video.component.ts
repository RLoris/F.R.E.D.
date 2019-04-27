import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-chill-music-video',
  templateUrl: './chill-music-video.component.html',
  styleUrls: ['./chill-music-video.component.css']
})
export class ChillMusicVideoComponent implements OnInit {

  displayPlaylist = false;

  constructor() { }

  ngOnInit() {
  }

  togglePlaylist() {
    this.displayPlaylist = !this.displayPlaylist;
  }
}
