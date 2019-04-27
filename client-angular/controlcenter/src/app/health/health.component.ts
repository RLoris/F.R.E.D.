import { Component, OnInit } from '@angular/core';
import MiBand from 'miband';

// @ts-ignore
const bluetooth = navigator.bluetooth;

@Component({
  selector: 'app-health',
  templateUrl: './health.component.html',
  styleUrls: ['./health.component.css']
})
export class HealthComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  async connect() {
    if (!bluetooth) {
        console.log('WebBluetooth is not supported by your browser!');
        return;
      }

    try {
        console.log('Requesting Bluetooth Device...');

        const device = await bluetooth.requestDevice({
          acceptAllDevices: true
        });

        if (device.gatt) {
          device.ongattserverdisconnected = () => console.log('Device disconnected');
          const server = device.gatt.connect();

          const miband = new MiBand(server);

          // await miband.init();
        }

        console.log(device);

      } catch (error) {
        console.log(error);
      }
  /*
    try {
        console.log('Requesting Bluetooth Device...');
        const device = await bluetooth.requestDevice({
          filters: [
            { services: [ MiBand.advertisementService ] }
          ],
          optionalServices: MiBand.optionalServices
        });

        device.addEventListener('gattserverdisconnected', () => {
          console.log('Device disconnected');
        });

        await device.gatt.disconnect();

        console.log('Connecting to the device...');
        const server = await device.gatt.connect();
        console.log('Connected');

        const miband = new MiBand(server);

        await miband.init();

        // await test_all(miband, log);

      } catch (error) {
        console.log('Argh!', error);
      }
    */
  }

}
