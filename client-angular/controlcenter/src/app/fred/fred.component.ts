import { Component, OnInit, EventEmitter, Output, Input, ViewChild } from '@angular/core';
import { LuisService, TextToSpeechService, SpeechToTextService } from '@oneroomic/facecognitivelibrary';
import { Observable } from 'rxjs';
import { Credentials } from './credentials';
import { Responses } from './responses';
import MediaStreamRecorder from 'msr';

@Component({
  selector: 'app-fred',
  templateUrl: './fred.component.html',
  styleUrls: ['./fred.component.css']
})
export class FredComponent implements OnInit {

  @Output()
  emitter: EventEmitter<any> = new EventEmitter<any>();
  @Input()
  receiver: Observable<any>;

  recording = false;
  @ViewChild('player')
  player;
  private lastBlob: Blob;
  holo = 'coral';

  private audioRecorder: MediaStreamRecorder;
  private mediaConstraints = {
    audio: true,
    video: false
  };

  constructor(
    private luisService: LuisService,
    private text2speech: TextToSpeechService,
    private speech2text: SpeechToTextService) {}

  ngOnInit() {
    this.receiver.subscribe(
      (data) => this.interact(data)
    );
    this.recording = false;

    navigator.getUserMedia(this.mediaConstraints,
      (stream) => {
        this.audioRecorder = new MediaStreamRecorder(stream);
        this.audioRecorder.stream = stream;
        this.audioRecorder.mimeType = 'audio/wav';
        this.audioRecorder.ondataavailable = (blob) => {
            this.lastBlob = blob;
            // this.player.nativeElement.controls = true;
            // this.player.nativeElement.srcObject = null;
            // this.player.nativeElement.src = URL.createObjectURL(blob);
        };
    },
      (error) => {
        console.log(error);
    });
  }

  interact(data) {
    if (data === 'miband') {
      if (this.recording) {
        this.holo = 'coral';
        console.log('stopping');
        this.stop();
      } else {
        this.holo = 'dodgerblue';
        this.talk(Responses.Help[0]);
        console.log('starting');
        setTimeout(() => this.start(), 2000);
      }
    } else if (data.say) {
      this.talk(data.say);
    }
    console.log(data);
  }

  styleBoxShadow() {
    return '0 0 60px ' + this.holo + ', inset 0 0 60px ' + this.holo;
  }

  listen() {
    const fileReader = new FileReader();
    fileReader.onload = (event: any) => {
      this.speech2text.speechToTextGoogle(event.target.result, Credentials.speech2textEndpoint, Credentials.speech2textKey, 'fr-FR')
      .subscribe((result) => {
        if (result) {
          this.process(result.results[0].alternatives[0].transcript);
        }
      });
    };
    fileReader.readAsArrayBuffer(this.lastBlob);
  }

  talk(response) {
    // tslint:disable-next-line:max-line-length
    const res = this.text2speech.textToSpeechGoogle(response, Credentials.text2speechEndpoint, Credentials.text2speechKey, 'fr-FR', 'MALE');
    res.subscribe(
      (result) => {
        this.player.nativeElement.src = 'data:audio/mpeg;base64,' + result.audioContent;
        this.player.nativeElement.play();
      },
      (err) => {
        console.log(err);
      }
    );
  }

  private process(query) {
    const res = this.luisService.query(query, Credentials.luisEndpoint, Credentials.luisKey);
    res.subscribe(
      (suc) => {
        console.log(suc);
        if (suc.topScoringIntent.intent) {
          const i = suc.topScoringIntent.intent;
          const response = Responses[i];
          this.emitter.emit(
            {
              intent: i,
              entities: suc.entities
            }
          );
          // random value
          this.talk(response[Math.floor(Math.random() * response.length)]);
        }
      },
      (err) => {
        console.log(err);
      }
    );
  }

  start() {
    this.recording = true;
    // max length audio 100 000 milli sec
    this.audioRecorder.start(100000);
  }

  stop() {
    this.recording = false;
    this.audioRecorder.stop();
    this.listen();
  }

}
