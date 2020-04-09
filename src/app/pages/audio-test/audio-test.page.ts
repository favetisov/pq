import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import adapter from 'webrtc-adapter';
import { Socket } from 'ngx-socket-io';

@Component({
  selector: 'audio-test-page',
  templateUrl: './audio-test.page.html',
  styleUrls: ['./audio-test.page.scss'],
})
export class AudioTestPage implements OnInit, OnDestroy {
  state = {
    loading: true,
  };
  error: string;
  localStream;
  remoteStream;
  remotePeerConnection;
  peerConnection;
  @ViewChild('player') audio: HTMLAudioElement;
  senderId: string;

  constructor(private socket: Socket) {}

  async ngOnInit() {
    this.createId();

    this.peerConnection = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.services.mozilla.com' }, { urls: 'stun:stun.l.google.com:19302' }],
    });
    this.peerConnection.onicecandidate = (event) => {
      console.log('ON ICE', event);
      event.candidate
        ? this.sendMessage(this.senderId, JSON.stringify({ ice: event.candidate }))
        : console.log('Sent all Ice');
    };
    this.peerConnection.onremovestream = (event) => {
      console.log('stream ended');
    };
    //также есть вариант с addstream
    this.peerConnection.ontrack = (event) => {
      this.remoteStream = event.streams[0];
    };
    const sessionDescription = await this.peerConnection.createOffer();
    await this.peerConnection.setLocalDescription(sessionDescription);
    this.socket.on('rtc', (e) => this.readMessage(e));
  }

  sendMessage(senderId, data) {
    this.socket.emit('rtc', { sender: senderId, message: data });
  }

  async readMessage(data) {
    console.log('received data', data);
    if (!data) return;
    try {
      const msg = JSON.parse(data.message);
      const sender = data.sender;
      if (sender !== this.senderId) {
        if (msg.ice !== undefined && this.peerConnection != null) {
          const candidate = new RTCIceCandidate(msg.ice);
          console.log(candidate, 'candidate');
          await this.peerConnection.addIceCandidate(candidate);
        } else if (msg.sdp.type === 'offer') {
          await this.peerConnection.setRemoteDescription(new RTCSessionDescription(msg.sdp));
          const answer = await this.peerConnection.createAnswer();
          await this.peerConnection.setLocalDescription(answer);
          this.sendMessage(this.senderId, JSON.stringify({ sdp: this.peerConnection.localDescription }));
        } else if (msg.sdp.type === 'answer') {
          await this.peerConnection.setRemoteDescription(new RTCSessionDescription(msg.sdp));
        }
      }
    } catch (error) {
      console.log(error);
    }
  }

  ngOnDestroy() {
    const tracks = this.localStream.getTracks();
    for (let i = 0; i < tracks.length; i++) {
      tracks[i].stop();
    }
  }

  createId() {
    const s4 = () =>
      Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);

    this.senderId = s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
  }
}
