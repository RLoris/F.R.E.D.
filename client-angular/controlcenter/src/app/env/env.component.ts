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
    setInterval(() => {
      this.meteo.vent = this.meteos[Math.floor(Math.random() * this.meteos.length)].vent;
      this.meteo.tempMin = this.meteos[Math.floor(Math.random() * this.meteos.length)].tempMin;
      this.meteo.tempMax = this.meteos[Math.floor(Math.random() * this.meteos.length)].tempMax;

    }, 3000);

    setInterval(() => { this.clock()}, 1000);
  }

  clock() {
      const date = new Date();

      let h = date.getHours().toString();
      let m = date.getMinutes().toString();
      let s = date.getSeconds().toString();
      h = (parseInt(h) == 0 || parseInt(h) < 10) ? '0' + h : h;
      m = (parseInt(m) < 10) ? '0' + m : m;
      s = (parseInt(s) < 10) ? '0' + s : s;
      const time = h + ':' + m + ':' + s;
      document.getElementById('clockDisplay').innerText = time;
      document.getElementById('clockDisplay').textContent = time;

  }

}
