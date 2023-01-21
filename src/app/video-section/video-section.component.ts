import {
  Component,
  OnInit,
  AfterViewInit,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Conversation, UserAgent, Session, Stream } from '@apirtc/apirtc';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-video-section',
  templateUrl: './video-section.component.html',
  styleUrls: ['./video-section.component.css'],
})
export class VideoSectionComponent implements OnInit {
    public msg="";
    public recordingBtnState=false;



  constructor(private fb: FormBuilder, public router:Router, private _snackBar: MatSnackBar) {}
  @ViewChild('localVideo') videoRef: any;

  conversationFormGroup = this.fb.group({
    name: this.fb.control('', [Validators.required]),
  });
  get conversationNameFc(): FormControl {
    return this.conversationFormGroup.get('name') as FormControl;
  }
  conversation: any;
  remotesCounter = 0;

  ngOnInit(): void {}

  createConversation() {
    let localStream: any;

    // CREATE USER AGENT

    let userAgent = new UserAgent({
      uri: 'apiKey:33f0724385fbd7087746cbca2d8daf09',
    });

    // REGISTER

    userAgent.register().then((session: Session) => {
      // CREATE CONVERSATION
      const conversation: Conversation = session.getConversation(
        this.conversationNameFc.value
      );
      this.conversation = conversation;

      // ADD EVENT LISTENER : WHEN NEW STREAM IS AVAILABLE IN CONVERSATION
      conversation.on('streamListChanged', (streamInfo: any) => {
        console.log('streamListChanged :', streamInfo);
        if (streamInfo.listEventType === 'added') {
          if (streamInfo.isRemote === true) {
            conversation
              .subscribeToMedia(streamInfo.streamId)
              .then((stream: Stream) => {
                console.log('subscribeToMedia success', stream);
              })
              .catch((err) => {
                console.error('subscribeToMedia error', err);
              });
          }
        }
      });
      // BIS/ ADD EVENT LISTENER : WHEN STREAM IS ADDED/REMOVED TO/FROM THE CONVERSATION
      conversation
        .on('streamAdded', (stream: Stream) => {
          this.remotesCounter += 1;
          stream.addInDiv(
            'remote-container',
            'remote-media-' + stream.streamId,
            {},
            false
          );
        })
        .on('streamRemoved', (stream: any) => {
          this.remotesCounter -= 1;
          stream.removeFromDiv(
            'remote-container',
            'remote-media-' + stream.streamId
          );
        });

      // 5/ CREATE LOCAL STREAM

      userAgent
        .createStream({
          constraints: {
            audio: true,
            video: true,
          },
        })
        .then((stream: Stream) => {
          console.log('createStream :', stream);
          this.msg= ' Stream Created Successfully'


          // Save local stream
          localStream = stream;

          // Display stream
          localStream.attachToElement(this.videoRef.nativeElement);

          // JOIN CONVERSATION
          conversation
            .join()
            .then(() => {
              //  PUBLISH LOCAL STREAM
              conversation
                .publish(localStream)
                .then((stream: Stream) => {
                  console.log('published', stream);
                })
                .catch((err: any) => {
                  console.error('publish error', err);

                });
            })
            .catch((err: any) => {
              console.error('Conversation join error', err);
            });
        })
        .catch((err: any) => {
          console.error('create stream error', err);
        });
    });
  }

  endCall(){
    this.conversation.leave().then(()=>{
      this.conversation.destroy();
      this._snackBar.open("Call ended", 'Close');
    }).then(()=>{
      location.reload();


    })
  }
  record(){
    this.conversation.startRecording().then((recordingInfo:any)=>{
      this.recordingBtnState=true
      this._snackBar.open("Recording start", 'Close');
      console.log("Recording start",recordingInfo);

    }).catch((error:any)=>{
      console.log(error);

    })
  }
  stopRecord(){
    this.conversation.stopRecording().then((recordingInfo:any)=>{
      this.recordingBtnState=false
      this._snackBar.open("Recording stopped", 'Close');
      console.log("stop recording", recordingInfo);
      this.conversation.on('recordingAvailable', (recordingInfo:any)=>{
        console.log("on:recordingAvailable", recordingInfo.mediaURL);
      })

    }).catch((error:any)=>{
      console.log("stop recording", error);

    })
  }
}
