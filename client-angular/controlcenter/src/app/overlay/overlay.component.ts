import { Component, OnInit, ViewChild } from '@angular/core';
import * as faceapi from 'face-api.js';
import { MatSnackBar } from '@angular/material';
import { DomSanitizer } from '@angular/platform-browser';
import { LabeledFaceDescriptors } from 'face-api.js';

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
  isOccupied = false;
  labeledDescriptors;
  private streamId;
  private detectId;
  private modelLoaded;


  // person in front of camera
  isDetected = false;
  detectedId = null;
  background = null;

  constructor(public toast: MatSnackBar, private sanitizer: DomSanitizer) {
    this.background = this.sanitizer.bypassSecurityTrustResourceUrl('./../../assets/dust.mp4');
    this.labeledDescriptors = [];
    this.loadModels();
  }

  ngOnInit() {
    this.detectedId = null;
    this.isDetected = true; // Wait
    this.opencam();
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
          async () => await faceapi.loadFaceExpressionModel('assets/models').then(
            async () => await this.lorisLabeledDescriptors().then (
              async () => await this.massimoLabeledDescriptors().then (
                async () => await this.melissaLabeledDescriptors().then (
                  async () => await this.guillaumeLabeledDescriptors().then (
                    async () => await this.romainLabeledDescriptors().then (
                      async () => await this.victorLabeledDescriptors().then(
                        () => this.modelLoaded = true
                      )
                    )
                  )
                )
              )
            )
          )
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
        if (this.modelLoaded) {
          console.log('scanning for face');
          const result = await faceapi.detectSingleFace(this.video.nativeElement)
          .withFaceLandmarks()
          .withFaceDescriptor();
          console.log(result);
          if (!result) {
            if (!this.detectedId) {
              this.detectedId = setTimeout( () => {
                // this.isDetected = false;
                this.isOccupied = false;
                this.background = this.sanitizer.bypassSecurityTrustResourceUrl('../../assets/dust.mp4');
                console.log('changing to dust');
                this.video.nativeElement.loop = true;
              }, 5000);
            }
          } else {
              clearTimeout(this.detectedId);
              if (!this.isOccupied) {
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
                }
                console.log(bestMatch.label.toString());
                this.isOccupied = true;
                this.video.nativeElement.loop = false;
                this.isDetected = true;
                setTimeout( () => {
                  this.background = this.sanitizer.bypassSecurityTrustResourceUrl('./../../assets/rain.mp4');
                  this.video.nativeElement.loop = true;
                }, 5000);
              }
          }
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
  }

  /* handles all type of errors from usermedia API */
  private handleError(error) {
    console.log('navigator.getUserMedia error: ', error);
  }


}
