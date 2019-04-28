import { Component, OnInit, ViewChild } from '@angular/core';
import * as faceapi from 'face-api.js';
import { MatSnackBar } from '@angular/material';
import { DomSanitizer } from '@angular/platform-browser';
import { LabeledFaceDescriptors } from 'face-api.js';
import { Subject } from 'rxjs';

faceapi.env.monkeyPatch({
  Canvas: HTMLCanvasElement,
  Image: HTMLImageElement,
  // tslint:disable-next-line:object-literal-shorthand
  ImageData: ImageData,
  Video: HTMLVideoElement,
  createCanvasElement: () => document.createElement('canvas'),
  createImageElement: () => document.createElement('img')
});

@Component({
  selector: 'app-overlay',
  templateUrl: './overlay.component.html',
  styleUrls: ['./overlay.component.css']
})
export class OverlayComponent implements OnInit {

  // preferred camera
  private videoSource;

  /* input stream devices */
  @ViewChild('devices')
  public videoSelect;
  /* selector devices */
  public selectors;

  // containers
  @ViewChild('canvas2')
  public canvas2;
  @ViewChild('webcam')
  public video;

  // stream video
  private stream;

  // loading models and stream not available
  displayStream = 'none';
  isLoading = true;
  private streamId;
  private detectId;

  // person in front of camera
  detectedId = null;
  background = null;
  backgrounds = [
    'dust',
    'rain2',
    'earth',
    'fire'
  ];
  lastBackground: string;

  // displayed widgets
  transitWidget = true;
  chillMusicVideoWidget = false;
  healthWidget = true;
  relaxWidget = false;

  // dispatching bot
  isFirstTry = true;
  isOccupied = false;
  isDust = false;
  cptTry = 3;
  labeledDescriptors;

  private modelLoaded;
  loadingStatus: number;
  // dispatching
  actionSubject = new Subject<any>();
  actionObservable = this.actionSubject.asObservable();

  constructor(public toast: MatSnackBar, private sanitizer: DomSanitizer) {
    this.background = this.sanitizer.bypassSecurityTrustResourceUrl('./../../assets/dust.mp4');
    this.labeledDescriptors = [];
    this.loadModels();
  }

  ngOnInit() {
    this.detectedId = null;
    this.opencam();
  }

  isVisible() {
    if (this.isOccupied) {
      return 'visible';
    } else {
      return 'hidden';
    }
  }

  displayWidget(status) {
    if (status && this.isVisible() === 'visible') {
      return 'visible';
    } else {
      return 'hidden';
    }
  }

  async loadModels() {
    this.loadingStatus = 0;
    await faceapi.loadSsdMobilenetv1Model('assets/models').then(
      async () => {
        this.loadingStatus = 10;
        await faceapi.loadFaceLandmarkModel('assets/models').then(
        async () => {
          this.loadingStatus = 20;
          await faceapi.loadFaceRecognitionModel('assets/models').then(
          async () => {
            this.loadingStatus = 30;
            await faceapi.loadFaceExpressionModel('assets/models').then(
            async () => await this.lorisLabeledDescriptors().then (
              async () => await this.massimoLabeledDescriptors().then (
                async () => await this.melissaLabeledDescriptors().then (
                  async () => await this.guillaumeLabeledDescriptors().then (
                    async () => await this.romainLabeledDescriptors().then (
                      async () => await this.victorLabeledDescriptors().then(
                        async () => await this.xavierLabeledDescriptors().then (
                        () => {
                          this.modelLoaded = true;
                          this.loadingStatus = 100;
                          }
                        )
                      )
                    )
                  )
                )
              )
            )
          );
        });
      });
    });
  }

  initStreamDetection(videoSource = null) {
    this.startStream(videoSource);
    console.log('starting scan');
    if (!this.detectId) {
      // detection interval: default 3000
      this.detectId = setInterval( async () => {
        if (this.modelLoaded) {
          console.log('scanning for face');
          const result = await faceapi.detectSingleFace(this.video.nativeElement)
          .withFaceExpressions()
          .withFaceLandmarks()
          .withFaceDescriptor();

          console.log(result);

          if (!result) {
            if (this.isFirstTry) {
              this.isFirstTry = false;
            }
            this.cptTry --;
            if (this.cptTry === 0) {
              if (!this.isDust) {
                this.cptTry = 3;
                this.detectedId = setTimeout( () => {
                  this.isOccupied = false;
                  this.isDust = true;
                  this.background = this.sanitizer.bypassSecurityTrustResourceUrl('../../assets/dust.mp4');
                  console.log('changing to dust');
                  this.video.nativeElement.loop = true;
                }, 5000);
              }
            }
          } else {
              if (this.isOccupied === false) {
                const faceMatcher = new faceapi.FaceMatcher(this.labeledDescriptors);
                const bestMatch = faceMatcher.findBestMatch(result.descriptor);
                switch (bestMatch.label) {
                  case 'Melissa' : {
                    this.background = this.sanitizer.bypassSecurityTrustResourceUrl('../../assets/melissa.mp4');
                    break;
                  }
                  case 'Guillaume' : {
                    this.background = this.sanitizer.bypassSecurityTrustResourceUrl('../../assets/guillaume.mp4');
                    break;
                  }
                  case 'Loris' : {
                    this.background = this.sanitizer.bypassSecurityTrustResourceUrl('../../assets/loris.mp4');
                    break;
                  }
                  case 'Romain' : {
                    this.background = this.sanitizer.bypassSecurityTrustResourceUrl('../../assets/romain.mp4');
                    break;
                  }
                  case 'Massimo' : {
                    this.background = this.sanitizer.bypassSecurityTrustResourceUrl('../../assets/massimo.mp4');
                    break;
                  }
                  case 'Victor' : {
                    this.background = this.sanitizer.bypassSecurityTrustResourceUrl('../../assets/victor.mp4');
                    break;
                  }
                  case 'Xavier' : {
                    this.background = this.sanitizer.bypassSecurityTrustResourceUrl('../../assets/guillaume.mp4');
                    break;
                  }
                  default: {
                    this.isOccupied = false;
                    this.background = this.sanitizer.bypassSecurityTrustResourceUrl('../../assets/dust.mp4');
                    return;
                  }
                }
                this.actionSubject.next( {welcome: 'Bonjour ' + bestMatch.label.toString() + ', content de vous revoir !'});
                console.log('nom : ' + bestMatch.label.toString());
                clearTimeout(this.detectedId);
                this.video.nativeElement.loop = false;
                this.isOccupied = true;
                setTimeout( () => {
                  this.isDust = false;
                  this.background = this.sanitizer.bypassSecurityTrustResourceUrl('./../../assets/rain2.mp4');
                  this.video.nativeElement.loop = true;
                }, 5000);
              }
              result.expressions.forEach( expression => {
                if (expression.probability >= 0.80) {
                  if (expression.expression === 'sad' || expression.expression === 'angry') {
                    // Operate changes on the environnement here
                    console.log(expression.expression);
                  }
                }
              } );
          }
        }
      }, 3000);
    }
  }

  private opencam() {
    /* initialize lib */
    navigator.mediaDevices
              .enumerateDevices()
              .then((d) => {
                this.selectors = this.getCaptureDevices(d);
                this.initStreamDetection();
              })
              .catch(this.handleError);
  }

   /* Start or restart the stream using a specific videosource and inject it in a container */
  public startStream(videoSource = null) {

    this.videoSource = localStorage.getItem('camId');

    if (navigator.mediaDevices) {
        if (this.selectors.map(s => s.id).indexOf(this.videoSource) === -1) {
          // check if prefered cam is available in the list
          this.videoSource = null;
        }
        // select specific camera on mobile
        this.videoSource = videoSource === null ?
        ( this.videoSource ? this.videoSource : this.selectors[0].id) : videoSource;

        // save prefered cam
        localStorage.setItem('camId', this.videoSource);

        // access the web cam
        navigator.mediaDevices.getUserMedia({
            audio : false,
            video: {
                // selfie mode
                // facingMode: 'user',
                deviceId: this.videoSource ? { exact: this.videoSource } : undefined
            }
        })
            // permission granted:
            .then( (stream) => {
                this.stream = stream;
                // on getUserMedia
                this.video.nativeElement.srcObject = stream;
                this.video.nativeElement.play();
                // set canvas size = video size when known
                this.video.nativeElement.addEventListener('loadedmetadata', () => {
                  // overlay
                  this.canvas2.nativeElement.width = this.video.nativeElement.videoWidth;
                  this.canvas2.nativeElement.height = this.video.nativeElement.videoHeight;
                });
            })
            // permission denied:
            .catch( (error) => {
              console.log('Camera init failed : ' + error.name);
            });
    }
    return this.video;
  }

   /* Detect possible capture devices */
  private getCaptureDevices(deviceInfos) {
    // Handles being called several times to update labels. Preserve values.
    const videouputs = [];
    // tslint:disable-next-line:prefer-for-of
    for (let i = 0; i < deviceInfos.length; i++) {
        if (deviceInfos[i].kind === 'videoinput') {
          videouputs.push({ id: deviceInfos[i].deviceId, label: deviceInfos[i].label});
        }
    }

    return videouputs;
  }

  private async guillaumeLabeledDescriptors() {
    const arrayDescriptors: Float32Array[] = [];
    for ( let i = 1; i <= 10; i++) {
      const img = new Image();
      const path = '../../assets/Guillaume/Premium' + i + '.jpg';
      img.src = path;

      const result = await faceapi.detectSingleFace(img)
          .withFaceLandmarks()
          .withFaceDescriptor();
      arrayDescriptors.push(result.descriptor);
    }

    this.labeledDescriptors.push(new LabeledFaceDescriptors('Guillaume', arrayDescriptors));

    this.loadingStatus = 70;
  }

  private async lorisLabeledDescriptors() {

    const arrayDescriptors: Float32Array[] = [];
    for ( let i = 1; i <= 10; i++) {
      const img = new Image();
      const path = '../../assets/Loris/Lolis' + i + '.jpg';
      img.src = path;

      const result = await faceapi.detectSingleFace(img)
          .withFaceLandmarks()
          .withFaceDescriptor();
      arrayDescriptors.push(result.descriptor);
    }

    this.labeledDescriptors.push(new LabeledFaceDescriptors('Loris', arrayDescriptors));

    this.loadingStatus = 40;
  }

  private async massimoLabeledDescriptors() {

    const arrayDescriptors: Float32Array[] = [];
    for ( let i = 1; i <= 10; i++) {
      const img = new Image();
      const path = '../../assets/Massimo/Chuck' + i + '.jpg';
      img.src = path;

      const result = await faceapi.detectSingleFace(img)
          .withFaceLandmarks()
          .withFaceDescriptor();
      arrayDescriptors.push(result.descriptor);
    }

    this.labeledDescriptors.push(new LabeledFaceDescriptors('Massimo', arrayDescriptors));

    this.loadingStatus = 50;
  }

  private async melissaLabeledDescriptors() {

    const arrayDescriptors: Float32Array[] = [];
    for ( let i = 1; i <= 10; i++) {
      const img = new Image();
      const path = '../../assets/Melissa/Melissa' + i + '.jpg';
      img.src = path;

      const result = await faceapi.detectSingleFace(img)
          .withFaceLandmarks()
          .withFaceDescriptor();
      arrayDescriptors.push(result.descriptor);
    }

    this.labeledDescriptors.push(new LabeledFaceDescriptors('Melissa', arrayDescriptors));

    this.loadingStatus = 60;
  }

  private async romainLabeledDescriptors() {

    const arrayDescriptors: Float32Array[] = [];
    for ( let i = 1; i <= 10; i++) {
      const img = new Image();
      const path = '../../assets/Romain/Cercle' + i + '.jpg';
      img.src = path;

      const result = await faceapi.detectSingleFace(img)
          .withFaceLandmarks()
          .withFaceDescriptor();
      arrayDescriptors.push(result.descriptor);
    }

    this.labeledDescriptors.push(new LabeledFaceDescriptors('Romain', arrayDescriptors));


    this.loadingStatus = 80;
  }

  private async victorLabeledDescriptors() {

    const arrayDescriptors: Float32Array[] = [];
    for ( let i = 1; i <= 10; i++) {
      const img = new Image();
      const path = '../../assets/Victor/Etchebest' + i + '.jpg';
      img.src = path;

      const result = await faceapi.detectSingleFace(img)
          .withFaceLandmarks()
          .withFaceDescriptor();
      arrayDescriptors.push(result.descriptor);
    }

    this.labeledDescriptors.push(new LabeledFaceDescriptors('Victor', arrayDescriptors));

    this.loadingStatus = 90;
  }

  private async xavierLabeledDescriptors() {

    const arrayDescriptors: Float32Array[] = [];
    for ( let i = 1; i <= 7; i++) {
      const img = new Image();
      const path = '../../assets/Xavier/Xavier' + i + '.png';
      img.src = path;

      const result = await faceapi.detectSingleFace(img)
          .withFaceLandmarks()
          .withFaceDescriptor();
      arrayDescriptors.push(result.descriptor);
    }

    this.labeledDescriptors.push(new LabeledFaceDescriptors('Xavier', arrayDescriptors));

    this.loadingStatus = 95;
  }

  /* handles all type of errors from usermedia API */
  private handleError(error) {
    console.log('navigator.getUserMedia error: ', error);
  }

  dispatcher($event) {
    if ($event === 'miband') {
      // buttonbot clicker
      this.actionSubject.next($event);
    } else if ($event.rate) {
      // heart rate
      // TODO :
    }
  }

  executeAction($action) {

    console.log('execute action');
    console.log($action);

    switch ($action.intent) {
      case 'ChangeBackground': {
        let bg;
        if ($action.entities.length > 0 && $action.entities[0].type === 'backgroundPreference') {
          // cosy mode
          if ($action.entities[0].entity === 'cosy') {
            bg = 'fire';
          }
        } else {
          do {
            bg = this.backgrounds[Math.floor(Math.random() * this.backgrounds.length)];
            console.log(bg);
          } while (bg === this.lastBackground);
        }
        this.lastBackground = bg;
        this.background = this.sanitizer.bypassSecurityTrustResourceUrl('./../../assets/' + bg + '.mp4');
        this.video.nativeElement.loop = true;
        break;
      }
      case 'DoRelaxationExercices': {
        if ($action.entities.length > 0) {
          if ($action.entities[0].resolution.values[0] === 'relaxation') {
            this.relaxWidget = true;
          }
        }
        break;
      }
      case 'PlayMusic': {
        if ($action.entities.length > 0) {
          if ($action.entities[0].resolution.values[0] === 'playlist') {
            this.chillMusicVideoWidget = true;
          }
        }
        break;
      }
      case 'ShowWidget': {
        if ($action.entities.length > 0 && $action.entities[0].type === 'widget') {
          if ($action.entities[0].resolution.values[0] === 'santé') {
            this.healthWidget = true;
          }
          if ($action.entities[0].resolution.values[0] === 'transit') {
            this.transitWidget = true;
          }
          if ($action.entities[0].resolution.values[0] === 'musique') {
            this.chillMusicVideoWidget = true;
          }
          if ($action.entities[0].resolution.values[0] === 'relaxation') {
            this.relaxWidget = true;
          }
        }
        break;
      }
      case 'HideWidget': {
        if ($action.entities.length > 0 && $action.entities[0].type === 'widget') {
          if ($action.entities[0].resolution.values[0] === 'santé') {
            this.healthWidget = false;
          }
          if ($action.entities[0].resolution.values[0] === 'transit') {
            this.transitWidget = false;
          }
          if ($action.entities[0].resolution.values[0] === 'musique') {
            this.chillMusicVideoWidget = false;
          }
          if ($action.entities[0].resolution.values[0] === 'relaxation') {
            this.relaxWidget = false;
          }
        }
        break;
      }
      case 'Warning': {
        setTimeout(() => {
          this.background = this.sanitizer.bypassSecurityTrustResourceUrl('./../../assets/storm.mp4');
          setTimeout( () => {
            this.isDust = false;
            this.background = this.sanitizer.bypassSecurityTrustResourceUrl('./../../assets/rain2.mp4');
            this.video.nativeElement.loop = true;
          }, 15000);
        }, 3000);
        break;
      }
      case 'None': {

        break;
      }
      default: {

      }
    }

  }

}
