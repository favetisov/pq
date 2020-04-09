import { Component, OnInit } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import adapter from 'webrtc-adapter';

@Component({
  selector: 'audio-broadcast-page',
  templateUrl: './audio-broadcast.page.html',
  styleUrls: ['./audio-broadcast.page.scss'],
})
export class AudioBroadcastPage implements OnInit {
  state = {
    loading: true,
  };

  stream;
  peerConnection;
  error: string;
  senderId: string;

  constructor(private socket: Socket) {}

  async ngOnInit() {
    this.createId();
  }

  async broadcast() {
    try {
      this.peerConnection = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.services.mozilla.com' }, { urls: 'stun:stun.l.google.com:19302' }],
      });

      this.peerConnection.onicecandidate = (event) => {
        console.log('ON ICE', event);
        event.candidate
          ? this.sendMessage(this.senderId, JSON.stringify({ ice: event.candidate }))
          : console.log('Sent all Ice');
      };

      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      this.peerConnection.addStream(this.stream);

      const offer = await this.peerConnection.createOffer({ offerToReceiveAudio: true });
      await this.peerConnection.setLocalDescription(offer);
      this.sendMessage(this.senderId, JSON.stringify({ sdp: this.peerConnection.localDescription }));
      this.socket.on('rtc', (e) => this.readMessage(e));
    } catch (e) {
      this.error = e;
    }
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

  createId() {
    const s4 = () =>
      Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);

    this.senderId = s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
  }
}
