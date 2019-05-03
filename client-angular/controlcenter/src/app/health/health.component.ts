import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import Miband from './miband';

// @ts-ignore
const bluetooth = navigator.bluetooth;

@Component({
  selector: 'app-health',
  templateUrl: './health.component.html',
  styleUrls: ['./health.component.css']
})
export class HealthComponent implements OnInit {

  battery;
  ped;
  rate;
  display = false;
  @Output()
  emitter: EventEmitter<any> = new EventEmitter<any>();

  constructor() { }

  ngOnInit(): void {
    this.display = false;
  }

  async selectDevice() {

    if (!bluetooth) {
        console.log('WebBluetooth is not supported by your browser!');
        return;
    }
    try {
        console.log('Requesting Bluetooth Device...');


        const device = await bluetooth.requestDevice({
              filters: [{ services: [ Miband.advertisementService ]}],
              optionalServices: Miband.optionalServices
            });

        // console.log(device);

        if (device.gatt) {
          this.connect(device);
        }

      } catch (error) {
        console.log(error);
      }
  }

  async connect(device) {
    this.display = false;

    device.ongattserverdisconnected = () => console.log('Device disconnected');

    await device.gatt.disconnect();

    const server = await device.gatt.connect();

    const miband = new Miband(server);

    await miband.init();
    this.retrieve(miband);
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async retrieve(miband) {
    console.log('retrieving data');

    const info = {
      hw_ver:   await miband.getHwRevision(),
      sw_ver:   await miband.getSwRevision(),
      serial:   await miband.getSerial(),
    };

    console.log(`HW ver: ${info.hw_ver}  SW ver: ${info.sw_ver}`);
    // tslint:disable-next-line:no-unused-expression
    info.serial && console.log(`Serial: ${info.serial}`);


    this.battery = await miband.getBatteryInfo();
    setInterval(async () => {
      this.battery = await miband.getBatteryInfo();
      console.log(this.battery + '%');
    }, 120000 );

    this.ped = await miband.getPedometerStats();
    setInterval(async () => {
      this.ped = await miband.getPedometerStats();
      console.log(this.ped);
    }, 10000);

    /*await miband.showNotification('message');
    await this.delay(3000);
    await miband.showNotification('phone');
    await this.delay(5000);
    await miband.showNotification('off');*/


    console.log('Heart Rate Monitor (continuous)...');
    miband.on('heart_rate', (rate) => {
      console.log('Heart Rate:', rate);
      this.rate = rate;
      this.emitter.emit({rate});
    });
    await miband.hrmStart();
    // await this.delay(30000);
    // await miband.hrmStop();

    /*console.log('Heart Rate Monitor (single-shot)');
    console.log('Result:', );
    setInterval( async () => {
      this.rate = await miband.hrmRead();
    }, 2000);*/

    miband.on('button', () => {
      this.emitter.emit('miband');
    });

    this.display = true;
    /*try {
      await miband.waitButton(10000);
    } catch (e) {
      console.log('OK, nevermind ;)');
    }*/
  }

}
