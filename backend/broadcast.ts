// Get the Medooze Media Server interface
const MediaServer = require('medooze-media-server');

// Get Semantic SDP objects
const SemanticSDP = require('semantic-sdp');
const SDPInfo = SemanticSDP.SDPInfo;
const MediaInfo = SemanticSDP.MediaInfo;
const CandidateInfo = SemanticSDP.CandidateInfo;
const DTLSInfo = SemanticSDP.DTLSInfo;
const ICEInfo = SemanticSDP.ICEInfo;
const StreamInfo = SemanticSDP.StreamInfo;
const TrackInfo = SemanticSDP.TrackInfo;
const Direction = SemanticSDP.Direction;
const CodecInfo = SemanticSDP.CodecInfo;

// Create new streamer
const streamer = MediaServer.createStreamer();

// Create new video session codecs
const video = new MediaInfo('video', 'video');

// Add h264 codec
video.addCodec(new CodecInfo('h264', 96));

// Create session for video
const session = streamer.createSession(video, {
  local: {
    port: 5004,
  },
});

export const handleRTC = (endpoint, socket) => {
  socket.on('rtc', (message) => {
    // Get cmd
    const msg = JSON.parse(message);

    // Get cmd
    if (msg.cmd === 'OFFER') {
      // Process the sdp
      const offer = SDPInfo.process(msg.offer);
      const transport = endpoint.createTransport(offer);
      // Get local DTLS and ICE info
      const dtls = transport.getLocalDTLSInfo();
      const ice = transport.getLocalICEInfo();

      // Get local candidates
      const candidates = endpoint.getLocalCandidates();

      // Create local SDP info
      let answer = new SDPInfo();

      // Add ice and dtls info
      answer.setDTLS(dtls);
      answer.setICE(ice);

      // For each local candidate
      for (let i = 0; i < candidates.length; ++i) {
        // Add candidate to media info
        answer.addCandidate(candidates[i]);
      }

      //Get remote video m-line info
      let videoOffer = offer.getMedia('video');

      // if offer had video
      if (videoOffer) {
        // Create video answer
        const video = videoOffer.answer({
          codecs: CodecInfo.MapFromNames(['VP8'], true),
          extensions: new Set([
            'urn:ietf:params:rtp-hdrext:toffset',
            'http://www.webrtc.org/experiments/rtp-hdrext/abs-send-time',
            //"urn:3gpp:video-orientation",
            'http://www.ietf.org/id/draft-holmer-rmcat-transport-wide-cc-extensions-01',
            'http://www.webrtc.org/experiments/rtp-hdrext/playout-delay',
            'urn:ietf:params:rtp-hdrext:sdes:rtp-stream-id',
            'urn:ietf:params:rtp-hdrext:sdes:repair-rtp-stream-id',
            'urn:ietf:params:rtp-hdrext:sdes:mid',
          ]),
          simulcast: true,
        });

        // Limit incoming bitrate
        video.setBitrate(4096);

        // Add it to answer
        answer.addMedia(video);
      }

      // Set RTP local  properties
      transport.setLocalProperties({
        video: answer.getMedia('video'),
      });

      const ts = Date.now();
      // Dump contents
      // transport.dump("/tmp/"+ts+".pcap");
      // Create recoreder
      const recorder = MediaServer.createRecorder(`/tmp/${ts}.mp4`);

      // For each stream offered
      for (const offered of offer.getStreams().values()) {
        // Create the remote stream into the transport
        const incomingStream = transport.createIncomingStream(offered);

        // Create new local stream
        const outgoingStream = transport.createOutgoingStream({
          audio: false,
          video: true,
        });

        // Get local stream info
        const info = outgoingStream.getStreamInfo();

        // Copy incoming data from the remote stream to the local one
        // todo add to connection?
        const transporder = outgoingStream.attachTo(incomingStream)[0];

        // Add local stream info it to the answer
        answer.addStream(info);

        // Record it
        recorder.record(incomingStream);
      }

      // Create an DTLS ICE transport in that enpoint
      // const transport = endpoint.createTransport({
      //   dtls: offer.getDTLS(),
      //   ice: offer.getICE(),
      // });

      // Set RTP remote properties
      // transport.setRemoteProperties({
      //   audio: offer.getMedia('audio'),
      //   video: offer.getMedia('video'),
      // });
      //
      // // Get local DTLS and ICE info
      // const dtls = transport.getLocalDTLSInfo();
      // const ice = transport.getLocalICEInfo();
      //
      // // Get local candidates
      // const candidates = endpoint.getLocalCandidates();
      //
      // // Create local SDP info
      // const answer = new SDPInfo();
      //
      // // Add ice and dtls info
      // answer.setDTLS(dtls);
      // answer.setICE(ice);
      //
      // // For each local candidate
      // for (let i = 0; i < candidates.length; ++i)
      //   // Add candidate to media info
      //   answer.addCandidate(candidates[i]);
      //
      // // Get remote video m-line info
      // const audioOffer = offer.getMedia('audio');
      //
      // // If offer had video
      // if (audioOffer) {
      //   // Create video media
      //   const audio = new MediaInfo(audioOffer.getId(), 'audio');
      //   // Set recv only
      //   audio.setDirection(Direction.INACTIVE);
      //   // Add it to answer
      //   answer.addMedia(audio);
      // }
      //
      // // Get remote video m-line info
      // const videoOffer = offer.getMedia('video');
      //
      // // If offer had video
      // if (videoOffer) {
      //   // Create video media
      //   const video = new MediaInfo(videoOffer.getId(), 'video');
      //
      //   // Get codec types
      //   const h264 = videoOffer.getCodec('h264');
      //   // Add video codecs
      //   video.addCodec(h264);
      //   // Set recv only
      //   video.setDirection(Direction.RECVONLY);
      //   // Add it to answer
      //   answer.addMedia(video);
      // }
      //
      // // Set RTP local  properties
      // transport.setLocalProperties({
      //   audio: answer.getMedia('audio'),
      //   video: answer.getMedia('video'),
      // });
      //
      // // Create new local stream with only video
      // const outgoingStream = transport.createOutgoingStream({
      //   audio: true,
      //   video: true,
      // });
      //
      // // Copy incoming data from the broadcast stream to the local one
      // outgoingStream.getVideoTracks()[0].attachTo(session.getIncomingStreamTrack());
      // outgoingStream.getAudioTracks()[0].attachTo(session.getIncomingStreamTrack());
      //
      // // Get local stream info
      // const info = outgoingStream.getStreamInfo();
      //
      // // Add local stream info it to the answer
      // answer.addStream(info);

      socket.emit('rtc', JSON.stringify({ answer: answer.toString() }));
      socket.on('close', () => {
        transport.stop();
        recorder.stop();
      });
    } else {
      // connection.transporder.selectEncoding(msg.rid);
      //Select layer
      // connection.transporder.selectLayer(parseInt(msg.spatialLayerId),parseInt(msg.temporalLayerId));
    }
  });
};
