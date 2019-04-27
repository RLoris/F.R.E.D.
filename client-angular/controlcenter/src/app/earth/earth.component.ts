import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-earth',
  templateUrl: './earth.component.html',
  styleUrls: ['./earth.component.css']
})
export class EarthComponent implements OnInit {

  angle;
  position;
  distance;

  constructor(private http: HttpClient) { }

  ngOnInit() {
    setInterval(() => this.call(), 5000);
  }

  call() {
    const endpoint = 'http://localhost:5000/';
    this.http.get<any>(endpoint).subscribe(
      (res) => {
        this.angle = res.Angle;
        this.distance = res.Distance;
        this.position = res.Position;
      },
      (err) => {
        console.log(err);
      }
    );
  }

}
