import { Component, OnInit, ViewChild } from '@angular/core';
import * as faceapi from 'face-api.js';
import { FaceMatcher, LabeledFaceDescriptors } from 'face-api.js';
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
  modelLoaded = false;
  labeledDescriptors;
  private streamId;
  private detectId;


  buttonLock = false;
  constructor() {
    this.labeledDescriptors = [];
    this.loadModels();
  }

  ngOnInit() {
    this.opencam();
    setTimeout(() => console.log(this.labeledDescriptors), 10000);
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
                      async () => await this.victorLabeledDescriptors()
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
          const result = await faceapi.detectSingleFace(this.video.nativeElement)
          .withFaceLandmarks()
          .withFaceDescriptor();
          if (!result) {
            console.log('no face recognized');
            return;
          } else {
            const faceMatcher = new faceapi.FaceMatcher(result);
            const bestMatch = faceMatcher.findBestMatch(result.descriptor);
            console.log(bestMatch.label.toString());
          }
        }
      }, 1000);
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

  private async guillaumeLabeledDescriptors() {
    const arrayDescriptors = [];
    for ( let i = 1; i <= 10; i++) {
      const img = new Image();
      const path = '../../assets/Guillaume/Premium' + i + '.jpg';
      img.src = path;

      const result = await faceapi.detectSingleFace(img)
          .withFaceLandmarks()
          .withFaceDescriptor();
      arrayDescriptors.push(result);
    }

    this.labeledDescriptors.push(new faceapi.LabeledFaceDescriptors(
      'Guillaume',
      arrayDescriptors
    ));

    console.log(this.labeledDescriptors);
  }

  private async lorisLabeledDescriptors() {

    const arrayDescriptors: Float32Array[] = new Float32Array();
    for ( let i = 1; i <= 10; i++) {
      const img = new Image();
      const path = '../../assets/Loris/Lolis' + i + '.jpg';
      img.src = path;

      const result = await faceapi.detectSingleFace(img)
          .withFaceLandmarks()
          .withFaceDescriptor();
      arrayDescriptors.push(result.descriptor);
    }

    const arrayLebeledDescriptors: LabeledFaceDescriptors = new LabeledFaceDescriptors('Loris', arrayDescriptors);
    /*
    this.labeledDescriptors.push(new faceapi.LabeledFaceDescriptors(
      'Loris',
      arrayDescriptors
    ));
    */
  }

  private async massimoLabeledDescriptors() {

    const arrayDescriptors = [];
    for ( let i = 1; i <= 10; i++) {
      const img = new Image();
      const path = '../../assets/Massimo/Chuck' + i + '.jpg';
      img.src = path;

      const result = await faceapi.detectSingleFace(img)
          .withFaceLandmarks()
          .withFaceDescriptor();
      arrayDescriptors.push(result);
    }

    this.labeledDescriptors.push(new faceapi.LabeledFaceDescriptors(
      'Massimo',
      arrayDescriptors
    ));


    console.log(this.labeledDescriptors);
  }

  private async melissaLabeledDescriptors() {

    const arrayDescriptors = [];
    for ( let i = 1; i <= 10; i++) {
      const img = new Image();
      const path = '../../assets/Melissa/Melissa' + i + '.jpg';
      img.src = path;
      console.log(path);

      const result = await faceapi.detectSingleFace(img)
          .withFaceLandmarks()
          .withFaceDescriptor();
      arrayDescriptors.push(result);
    }
    console.log(arrayDescriptors);

    this.labeledDescriptors.push(new faceapi.LabeledFaceDescriptors(
      'Melissa',
      arrayDescriptors
    ));


    console.log(this.labeledDescriptors);
  }

  private async romainLabeledDescriptors() {

    const arrayDescriptors = [];
    for ( let i = 1; i <= 10; i++) {
      const img = new Image();
      const path = '../../assets/Romain/Cercle' + i + '.jpg';
      img.src = path;

      const result = await faceapi.detectSingleFace(img)
          .withFaceLandmarks()
          .withFaceDescriptor();
      arrayDescriptors.push(result);
    }

    this.labeledDescriptors.push(new faceapi.LabeledFaceDescriptors(
      'Romain',
      arrayDescriptors
    ));


    console.log(this.labeledDescriptors);
  }

  private async victorLabeledDescriptors() {

    const arrayDescriptors = [];
    for ( let i = 1; i <= 10; i++) {
      const img = new Image();
      const path = '../../assets/Victor/Etchebest' + i + '.jpg';
      img.src = path;

      const result = await faceapi.detectSingleFace(img)
          .withFaceLandmarks()
          .withFaceDescriptor();
      arrayDescriptors.push(result);
    }

    this.labeledDescriptors.push(new faceapi.LabeledFaceDescriptors(
      'Victor',
      arrayDescriptors
    ));


    console.log(this.labeledDescriptors);
  }

  /* handles all type of errors from usermedia API */
  private handleError(error) {
    console.log('navigator.getUserMedia error: ', error);
  }


}
