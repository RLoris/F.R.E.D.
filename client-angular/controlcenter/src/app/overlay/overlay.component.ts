import { Component, OnInit, ViewChild } from '@angular/core';
import * as faceapi from 'face-api.js';
import { MatSnackBar } from '@angular/material';
import { DomSanitizer } from '@angular/platform-browser';

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

  buttonLock = false;

  // person in front of camera
  isDetected = false;
  detectedId = null;
  background = null;

  constructor(public toast: MatSnackBar, private sanitizer: DomSanitizer) {
    this.background = this.sanitizer.bypassSecurityTrustResourceUrl('../../assets/dust.mp4');
  }

  ngOnInit() {
    this.detectedId = null;
    this.isDetected = false;
    this.opencam();
    this.loadModels();
  }

  isVisible() {
    if (this.isDetected) {
      return 'visible';
    } else {
      return 'hidden';
    }
  }

  async loadModels() {
    await faceapi.loadSsdMobilenetv1Model('assets/models').then(
      async () => await faceapi.loadFaceLandmarkModel('assets/models').then(
        async () => await faceapi.loadFaceRecognitionModel('assets/models').then(
          async () => await faceapi.loadFaceExpressionModel('assets/models')
        )
      )
    );
  }

  initStreamDetection(videoSource = null) {
    this.startStream(videoSource);
    console.log('starting scan');
    if (!this.detectId) {
      // detection interval: default 3000
      this.detectId = setInterval( async () => {
        console.log('scanning for face');
        const result = await faceapi.detectSingleFace(this.video.nativeElement)
        .withFaceLandmarks()
        .withFaceDescriptor();
        if (!result) {
          if (!this.detectedId) {
            this.detectedId = setTimeout( () => {
              this.isDetected = false;
              this.background = this.sanitizer.bypassSecurityTrustResourceUrl('../../assets/dust.mp4');
              console.log('changing to dust');
              this.video.nativeElement.loop = true;
            }, 10000);
          }
        } else {
          console.log('someone detected');
          clearTimeout(this.detectedId);
          if (this.isDetected === false) {
            console.log('changing to preview');
            this.background = this.sanitizer.bypassSecurityTrustResourceUrl('../../assets/preview.mp4');
            this.video.nativeElement.loop = false;
          }
          this.detectedId = null;
          this.isDetected = true;
        }
      }, 2000);
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
          console.log(deviceInfos[i].label + '' + i);
          videouputs.push({ id: deviceInfos[i].deviceId, label: deviceInfos[i].label});
        }
    }

    return videouputs;
  }

  /* handles all type of errors from usermedia API */
  private handleError(error) {
    console.log('navigator.getUserMedia error: ', error);
  }


}
