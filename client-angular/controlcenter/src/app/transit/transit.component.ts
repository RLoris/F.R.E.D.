import { VAISSEAUX } from './mock-vaisseaux';
import { Vaisseau } from './vaisseau';
import { Component, OnInit } from '@angular/core';


@Component({
  selector: 'app-transit',
  templateUrl: './transit.component.html',
  styleUrls: ['./transit.component.css']
})
export class TransitComponent implements OnInit {

  constructor() { }

  public vaisseaux: Vaisseau[] = [];
  public vaisseau: Vaisseau;


  ngOnInit() {

    this.countdown();
    this.vaisseaux = VAISSEAUX;
    this.vaisseau = this.vaisseaux[Math.floor(Math.random() * this.vaisseaux.length)];
    
  }


  countdown(){
// Set the date we're counting down to
  let countDownDate = new Date('Jan 5, 2020 15:00:25').getTime();

// Update the count down every 1 second
  let x = setInterval(function() {

  // Get todays date and time
  let now = new Date().getTime();

  // Find the distance between now and the count down date
  let distance = countDownDate - now;

  // Time calculations for days, hours, minutes and seconds
  let days = Math.floor(distance / (1000 * 60 * 60 * 24));
  let hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  let minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  let seconds = Math.floor((distance % (1000 * 60)) / 1000);

  // Display the result in the element with id="demo"
  document.getElementById('countdown').innerHTML = days + ' j ' + hours + ' h '
  + minutes + ' m ' + seconds + ' s ';

  // If the count down is finished, write some text
  if (distance < 0) {
    clearInterval(x);
    document.getElementById('countdown').innerHTML = 'Arrivals';
  }
  }, 1000);

}

}
