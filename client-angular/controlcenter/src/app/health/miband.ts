import { EventEmitter } from 'events';
import { createCipheriv, Cipher } from 'crypto';

const UUID_BASE = (x) => `0000${x}-0000-3512-2118-0009af100700`;

const UUID_SERVICE_GENERIC_ACCESS =     0x1800;
const UUID_SERVICE_GENERIC_ATTRIBUTE =  0x1801;
const UUID_SERVICE_DEVICE_INFORMATION = 0x180a;
const UUID_SERVICE_FIRMWARE =           UUID_BASE('1530');
const UUID_SERVICE_ALERT_NOTIFICATION = 0x1811;
const UUID_SERVICE_IMMEDIATE_ALERT =    0x1802;
const UUID_SERVICE_HEART_RATE =         0x180d;
const UUID_SERVICE_MIBAND_1 =           0xfee0;
const UUID_SERVICE_MIBAND_2 =           0xfee1;

export default class Miband extends EventEmitter {

  device;
  char;
  key;
  textDec;
  hrmTimer;

  static get advertisementService() { return 0xFEE0; }

  static get optionalServices() { return [
    UUID_SERVICE_GENERIC_ACCESS,
    UUID_SERVICE_GENERIC_ATTRIBUTE,
    UUID_SERVICE_DEVICE_INFORMATION,
    UUID_SERVICE_FIRMWARE,
    UUID_SERVICE_ALERT_NOTIFICATION,
    UUID_SERVICE_IMMEDIATE_ALERT,
    UUID_SERVICE_HEART_RATE,
    UUID_SERVICE_MIBAND_1,
    UUID_SERVICE_MIBAND_2,
  ]; }

  constructor(peripheral) {
    super();

    this.device = peripheral;
    this.char = {} as any;

    // TODO: this is constant for now, but should random and managed per-device
    // @ts-ignore
    this.key = new Buffer('30313233343536373839404142434445', 'hex');
    this.textDec = new TextDecoder();
  }

  async startNotificationsFor(c) {
    const char = this.char[c];
    await char.startNotifications();
    char.addEventListener('characteristicvaluechanged', this._handleNotify.bind(this));
  }

  async init() {
    const miband2 = await this.device.getPrimaryService(UUID_SERVICE_MIBAND_2);
    this.char.auth = await miband2.getCharacteristic(UUID_BASE('0009'));

    const miband1 = await this.device.getPrimaryService(UUID_SERVICE_MIBAND_1);
    this.char.time =   await miband1.getCharacteristic(0x2a2b);
    this.char.raw_ctrl = await miband1.getCharacteristic(UUID_BASE('0001'));
    this.char.raw_data = await miband1.getCharacteristic(UUID_BASE('0002'));
    this.char.config = await miband1.getCharacteristic(UUID_BASE('0003'));
    this.char.activ =  await miband1.getCharacteristic(UUID_BASE('0005'));
    this.char.batt =   await miband1.getCharacteristic(UUID_BASE('0006'));
    this.char.steps =  await miband1.getCharacteristic(UUID_BASE('0007'));
    this.char.user =   await miband1.getCharacteristic(UUID_BASE('0008'));
    this.char.event =  await miband1.getCharacteristic(UUID_BASE('0010'));

    const hrm = await this.device.getPrimaryService(UUID_SERVICE_HEART_RATE);
    this.char.hrm_ctrl = await hrm.getCharacteristic(0x2a39);
    this.char.hrm_data = await hrm.getCharacteristic(0x2a37);

    // tslint:disable-next-line:variable-name
    const imm_alert = await this.device.getPrimaryService(UUID_SERVICE_IMMEDIATE_ALERT);
    this.char.alert = await imm_alert.getCharacteristic(0x2a06);

    const devinfo = await this.device.getPrimaryService(UUID_SERVICE_DEVICE_INFORMATION);
    this.char.info_hwrev = await devinfo.getCharacteristic(0x2a27);
    this.char.info_swrev = await devinfo.getCharacteristic(0x2a28);
    try { // Serial Number is in blocklist of WebBluetooth spec
      this.char.info_serial = await devinfo.getCharacteristic(0x2a25);
    } catch (error) {
      // do nothing
    }

    const fw = await this.device.getPrimaryService(UUID_SERVICE_FIRMWARE);
    this.char.fw_ctrl = await fw.getCharacteristic(UUID_BASE('1531'));
    this.char.fw_data = await fw.getCharacteristic(UUID_BASE('1532'));

    await this.startNotificationsFor('auth');

    await this.authenticate();

    // Notifications should be enabled after auth
    for (const char of ['hrm_data', 'event', 'raw_data']) {
      await this.startNotificationsFor(char);
    }
  }

  /*
   * Authentication
   */

  async authenticate() {
    await this.authReqRandomKey();

    return new Promise((resolve, reject) => {
      setTimeout(() => reject('Timeout'), 15000);
      // @ts-ignore
      this.once('authenticated', resolve);
    });
  }

  authSendNewKey(key)       { return this.char.auth.writeValue(this.AB([0x01, 0x08]), key); }
  authReqRandomKey()        { return this.char.auth.writeValue(this.AB([0x02, 0x08])); }
  authSendEncKey(encrypted) { return this.char.auth.writeValue(this.AB([0x03, 0x08]), encrypted); }

  /*
   * Button
   */

  waitButton(timeout = 10000) {
    return new Promise((resolve, reject) => {
      setTimeout(() => reject('Timeout'), timeout);
      // @ts-ignore
      this.once('button', resolve);
    });
  }

  /*
   * Notifications
   */

  async showNotification(type = 'message') {
    console.log('Notification:', type);
    switch (type) {
    case 'message': this.char.alert.writeValue(this.AB([0x01]));   break;
    case 'phone':   this.char.alert.writeValue(this.AB([0x02]));   break;
    case 'vibrate': this.char.alert.writeValue(this.AB([0x03]));   break;
    case 'off':     this.char.alert.writeValue(this.AB([0x00]));   break;
    default:        throw new Error('Unrecognized notification type');
    }
  }

  /*
   * Heart Rate Monitor
   */

  async hrmRead() {
    await this.char.hrm_ctrl.writeValue(this.AB([0x15, 0x01, 0x00]));
    await this.char.hrm_ctrl.writeValue(this.AB([0x15, 0x02, 0x00]));
    await this.char.hrm_ctrl.writeValue(this.AB([0x15, 0x02, 0x01]));
    return new Promise((resolve, reject) => {
      setTimeout(() => reject('Timeout'), 15000);
      // @ts-ignore
      this.once('heart_rate', resolve);
    });
  }

  async hrmStart() {
    await this.char.hrm_ctrl.writeValue(this.AB([0x15, 0x02, 0x00]));
    await this.char.hrm_ctrl.writeValue(this.AB([0x15, 0x01, 0x00]));
    await this.char.hrm_ctrl.writeValue(this.AB([0x15, 0x01, 0x01]));

    // Start pinging HRM
    this.hrmTimer = this.hrmTimer || setInterval(() => {
      console.log('Pinging HRM');
      this.char.hrm_ctrl.writeValue(this.AB([0x16]));
    }, 12000);
  }

  async hrmStop() {
    clearInterval(this.hrmTimer);
    this.hrmTimer = undefined;
    await this.char.hrm_ctrl.writeValue(this.AB([0x15, 0x01, 0x00]));
  }

  /*
   * Pedometer
   */

  async getPedometerStats() {
    let data = await this.char.steps.readValue();
    // @ts-ignore
    data = Buffer.from(data.buffer);
    const result = {} as any;
    // unknown = data.readUInt8(0)
    result.steps = data.readUInt16LE(1);
    // unknown = data.readUInt16LE(3) // 2 more bytes for steps? ;)
    if (data.length >= 8)  {
      result.distance = data.readUInt32LE(5);
    }
    if (data.length >= 12) {
      result.calories = data.readUInt32LE(9);
    }
    return result;
  }

  /*
   * General functions
   */

  async getBatteryInfo() {
    let data = await this.char.batt.readValue();
    // @ts-ignore
    data = Buffer.from(data.buffer);
    if (data.length <= 2) {
      return 'unknown';
    }

    const result = {} as any;
    result.level = data[1];
    result.charging = !!data[2];
    result.off_date = this.parseDate(data.slice(3, 10));
    result.charge_date = this.parseDate(data.slice(11, 18));
    // result.charge_num = data[10]
    result.charge_level = data[19];
    return result;
  }

  async getTime() {
    let data = await this.char.time.readValue();
    // @ts-ignore
    data = Buffer.from(data.buffer);
    return this.parseDate(data);
  }

  async getSerial() {
    if (!this.char.info_serial) {
      return undefined;
    }
    const data = await this.char.info_serial.readValue();
    return this.textDec.decode(data);
  }

  async getHwRevision() {
    let data = await this.char.info_hwrev.readValue();
    data = this.textDec.decode(data);
    if (data.startsWith('V') || data.startsWith('v')) {
      data = data.substring(1);
    }
    return data;
  }

  async getSwRevision() {
    let data = await this.char.info_swrev.readValue();
    data = this.textDec.decode(data);
    if (data.startsWith('V') || data.startsWith('v')) {
      data = data.substring(1);
    }
    return data;
  }

  async setUserInfo(user) {
    // @ts-ignore
    const data = new Buffer(16);
    data.writeUInt8   (0x4f, 0); // Set user info command

    data.writeUInt16LE(user.born.getFullYear(), 3);
    data.writeUInt8   (user.born.getMonth() + 1, 5);
    data.writeUInt8   (user.born.getDate(), 6);
    switch (user.sex) {
    case 'male':   data.writeUInt8   (0, 7); break;
    case 'female': data.writeUInt8   (1, 7); break;
    default:       data.writeUInt8   (2, 7); break;
    }
    data.writeUInt16LE(user.height,  8); // cm
    data.writeUInt16LE(user.weight, 10); // kg
    data.writeUInt32LE(user.id,     12); // id

    await this.char.user.writeValue(this.AB(data));
  }

  // async reboot() {
  //  await this.char.fw_ctrl.writeValue(AB([0x05]))
  // }

  /*
   * RAW data
   */

  async rawStart() {
    await this.char.raw_ctrl.writeValue(this.AB([0x01, 0x03, 0x19]));
    await this.hrmStart();
    await this.char.raw_ctrl.writeValue(this.AB([0x02]));
  }

  async rawStop() {
    await this.char.raw_ctrl.writeValue(this.AB([0x03]));
    await this.hrmStop();
  }

  /*
   * Internals
   */

  async _handleNotify(event) {
    // @ts-ignore
    const value = Buffer.from(event.target.value.buffer);

    if (event.target.uuid === this.char.auth.uuid) {
      const cmd = value.slice(0, 3).toString('hex');
      if (cmd === '100101') {         // Set New Key OK
        this.authReqRandomKey();
      } else if (cmd === '100201') {  // Req Random Number OK
        // console.log(crypto);
        // const cipher = await crypto.subtle.encrypt('aes-128-ecb', this.key, null);
        const rdn = value.slice(3);
        const cipher: Cipher = createCipheriv('aes-128-ecb', this.key, '');
        console.log(cipher);
        const encrypted = Buffer.concat([cipher.update(rdn), cipher.final()]);
        console.log(encrypted);
        this.authSendEncKey(encrypted);
      } else if (cmd === '100301') {
        console.log('Authenticated');
        // @ts-ignore
        this.emit('authenticated');

      } else if (cmd === '100104') {  // Set New Key FAIL
        // @ts-ignore
        this.emit('error', 'Key Sending failed');
      } else if (cmd === '100204') {  // Req Random Number FAIL
        // @ts-ignore
        this.emit('error', 'Key Sending failed');
      } else if (cmd === '100304') {
        console.log('Encryption Key Auth Fail, sending new key...');
        this.authSendNewKey(this.key);
      } else {
        console.log('Unhandled auth rsp:', value);
      }

    } else if (event.target.uuid === this.char.hrm_data.uuid) {
      const rate = value.readUInt16BE(0);
      // @ts-ignore
      this.emit('heart_rate', rate);

    } else if (event.target.uuid === this.char.event.uuid) {
      const cmd = value.toString('hex');
      if (cmd === '04') {
        // @ts-ignore
        this.emit('button');
      } else {
        console.log('Unhandled event:', value);
      }
    } else if (event.target.uuid === this.char.raw_data.uuid) {
      // TODO: parse adxl362 data
      // https://github.com/Freeyourgadget/Gadgetbridge/issues/63#issuecomment-302815121
      console.log('RAW data:', value);
    } else {
      console.log(event.target.uuid, '=>', value);
    }
  }

  AB(arg) {
    let args = [arg];

    // Convert all arrays to buffers
    args = args.map((i) => {
      if (i instanceof Array) {
        // @ts-ignore
        return Buffer.from(i);
      }
      return i;
    });

    // Merge into a single buffer
    // @ts-ignore
    const buf = Buffer.concat(args);

    // Convert into ArrayBuffer
    const ab = new ArrayBuffer(buf.length);
    const view = new Uint8Array(ab);
    for (let i = 0; i < buf.length; ++i) {
      view[i] = buf[i];
    }
    return ab;
  }

  parseDate(buff) {
    // tslint:disable-next-line:one-variable-per-declaration
    const year = buff.readUInt16LE(0),
      mon = buff[2] - 1,
      day = buff[3],
      hrs = buff[4],
      min = buff[5],
      sec = buff[6],
      msec = buff[8] * 1000 / 256;
    return new Date(year, mon, day, hrs, min, sec);
  }
}
