import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-office',
  templateUrl: './office.component.html',
  styleUrls: ['./office.component.css']
})
export class OfficeComponent implements OnInit {

  temperatures = [
    17, 18, 19, 20, 21, 22, 23, 24, 25
  ];

  oxygenes = [
    10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34
  ];

  oxygene = 21;

  temperature = 19;

  constructor() { }

  ngOnInit() {
    setInterval(() => {
      this.temperature = this.temperatures[Math.floor(Math.random() * this.temperatures.length)];
      this.oxygene = this.oxygenes[Math.floor(Math.random() * this.oxygenes.length)];
    }, 10000);
  }

}
