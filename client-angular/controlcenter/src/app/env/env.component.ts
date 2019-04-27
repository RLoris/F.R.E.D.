import { SCENARIO } from './mock-env';
import { Meteo } from './meteo';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-env',
  templateUrl: './env.component.html',
  styleUrls: ['./env.component.css']
})
export class EnvComponent implements OnInit {

  public meteos: Meteo[] = [];
  public meteo: Meteo;

  constructor() { }

  ngOnInit() {
    this.meteos = SCENARIO;
    this.meteo = this.meteos[Math.floor(Math.random() * this.meteos.length)];
  }

}
