import { Component, OnDestroy, OnInit } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { environment } from '@env';

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
  stream: MediaStream;
  pc;
  sdp;
  senderId: string;
  // localStream;
  // remoteStream;
  // remotePeerConnection;
  // peerConnection;
  // @ViewChild('player') audio: HTMLAudioElement;
  environment = environment;

  constructor(private socket: Socket) {}

  // async ngOnInit() {
  //   this.pc = window.RTCPeerConnection
  //     ? new RTCPeerConnection({
  //         bundlePolicy: 'max-bundle',
  //         rtcpMuxPolicy: 'require',
  //       })
  //     : new webkitRTCPeerConnection(null);
  //
  //   this.pc.ontrack = (event) => {
  //     console.log('ontrack');
  //     this.stream = event.streams[0];
  //   };
  //   this.pc.onaddstream = (event) => {
  //     console.log('on stream');
  //     this.stream = event.stream;
  //   };
  //   // this.pc.onremovestream = this.stream = null;
  //   const offer = await this.pc.createOffer({ offerToReceiveVideo: true, offerToReceiveAudio: true });
  //   this.sdp = offer.sdp;
  //   await this.pc.setLocalDescription(offer);
  //   this.socket.emit('rtc', JSON.stringify({ cmd: 'OFFER', offer: this.sdp }));
  //
  //   this.socket.on('rtc', (event) => {
  //     const msg = JSON.parse(event);
  //     this.pc.setRemoteDescription(new RTCSessionDescription({ type: 'answer', sdp: msg.answer }));
  //   });
  // }

  // async ngOnDestroy() {}

  async ngOnInit() {
    const turnConfig = [
      { urls: 'stun:pyuq.ru:4455' },
      { urls: 'stun:pyuq.ru:5544' },
      // {
      //   urls: 'turn:pyuq.ru:5544?transport=udp',
      //   credential: 'pyuqrtc',
      //   username: 'pyuq',
      // },
      // {
      //   urls: 'turn:pyuq.ru:4455?transport=udp',
      //   credential: 'pyuqrtc',
      //   username: 'pyuq',
      // },
    ];
    console.log('updated config');
    // await this.checkTURNServer(turnConfig, 5000);
    this.createId();

    this.pc = new RTCPeerConnection({
      iceServers: turnConfig,
    });
    this.pc.onicecandidate = (event) => {
      console.log('ON ICE', event);
      event.candidate
        ? this.sendMessage(this.senderId, JSON.stringify({ ice: event.candidate }))
        : console.log('Sent all Ice');
    };
    this.pc.onremovestream = (event) => {
      console.log('stream ended');
    };
    // также есть вариант с addstream
    this.pc.ontrack = (event) => {
      console.log('ONTRACK', event.streams);
      this.stream = event.streams[0];
    };
    // this.pc.onaddstream = (event) => {
    //   console.log('ON STREAM', event.stream);
    //   this.stream = event.stream;
    // };
    const sessionDescription = await this.pc.createOffer({ offerToReceiveAudio: true });
    await this.pc.setLocalDescription(sessionDescription);
    this.socket.on('rtc', (e) => this.readMessage(e));
  }

  sendMessage(senderId, data) {
    this.socket.emit('rtc', { sender: senderId, message: data });
  }

  async readMessage(data) {
    console.log(data);
    if (!data) return;
    try {
      const msg = JSON.parse(data.message);
      const sender = data.sender;
      if (sender !== this.senderId) {
        if (msg.ice !== undefined && this.pc != null) {
          const candidate = new RTCIceCandidate(msg.ice);
          console.log(candidate, 'candidate');
          await this.pc.addIceCandidate(candidate);
        } else if (msg.sdp.type === 'offer') {
          await this.pc.setRemoteDescription(new RTCSessionDescription(msg.sdp));
          const answer = await this.pc.createAnswer();
          await this.pc.setLocalDescription(answer);
          this.sendMessage(this.senderId, JSON.stringify({ sdp: this.pc.localDescription }));
        } else if (msg.sdp.type === 'answer') {
          await this.pc.setRemoteDescription(new RTCSessionDescription(msg.sdp));
        }
      }
    } catch (error) {
      console.log(error);
    }
  }

  ngOnDestroy() {}

  createId() {
    const s4 = () =>
      Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);

    this.senderId = s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
  }
}
