import { Component, OnInit } from '@angular/core';
import { log } from 'util';
import MiBand from 'miband';


@Component({
  selector: 'app-health',
  templateUrl: './health.component.html',
  styleUrls: ['./health.component.css']
})
export class HealthComponent implements OnInit {

  constructor() { }

  async ngOnInit() {
    // @ts-ignore
    const bluetooth = navigator.bluetooth;

    const device = await bluetooth.requestDevice({
      filters: [
        { services: [MiBand.advertisementService] }
      ],
      optionalServices: MiBand.optionalServices
    });

    const server = await device.gatt.connect();

    const miband = new MiBand(server);
    await miband.init();

    log('Notifications demo...')
    await miband.showNotification('message');
  }

}
