var connection = (function(){
  var localStream;
  var ws;

  var servers = {
    iceServers: [
      {url:'stun:stun.l.google.com:19302'},
      {url:'stun:stun1.l.google.com:19302'},
      {url:'stun:stun2.l.google.com:19302'},
      {url:'stun:stun3.l.google.com:19302'},
      {url:'stun:stun4.l.google.com:19302'},
      {url:'stun:stun01.sipphone.com'},
      {url:'stun:stun.ekiga.net'},
      {url:'stun:stun.fwdnet.net'},
      {url:'stun:stun.ideasip.com'},
      {url:'stun:stun.iptel.org'},
      {url:'stun:stun.rixtelecom.se'},
      {url:'stun:stun.schlund.de'},
      {url:'stun:stunserver.org'},
      {url:'stun:stun.softjoys.com'},
      {url:'stun:stun.voiparound.com'},
      {url:'stun:stun.voipbuster.com'},
      {url:'stun:stun.voipstunt.com'},
      {url:'stun:stun.voxgratia.org'},
      {url:'stun:stun.xten.com'},
      {
        url: 'turn:numb.viagenie.ca',
        credential: 'muazkh',
        username: 'webrtc@live.com'
      },
      {
        url: 'turn:192.158.29.39:3478?transport=udp',
        credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
        username: '28224511:1379330808'
      },
      {
        url: 'turn:192.158.29.39:3478?transport=tcp',
        credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
        username: '28224511:1379330808'
      }
    ]
  };

  var constraints = {
    audio: true,
    video: {
      mandatory: {
        maxWidth: 320,
        maxHeight: 240,
        minFrameRate: 20
      },
      optional: []
    }
  };

  var errorHandler = function(error){
    console.log(error);
  }

  var messageHandler = function (msg) {
      console.log('message: ', msg);
      var message = JSON.parse(msg);

      var data = message.data;
      var from = message.from;

      if (data.type === 'offer' || data.type === 'answer' || data.type === 'candidate'){
        var client = clients.findOne({key:from});
      }

      if (data.type === 'offer') {
          console.log('offer complete');

          var newPc = createPeerConnection(localStream, from);
          newPc.setRemoteDescription(new RTCSessionDescription(data));
          newPc.createAnswer(function(description){ gotLocalDescription.call(from, description);}, errorHandler, { 'mandatory': { 'OfferToReceiveAudio': true, 'OfferToReceiveVideo': true } });//create answer

      } else if (data.type === 'answer') {
          console.log('answer complete');

          client.pc.setRemoteDescription(new RTCSessionDescription(data));

      } else if (data.type === 'candidate') {
          console.log('candidate complete');

          var candidate = new RTCIceCandidate(data);
          client.pc.addIceCandidate(candidate);

      } else if (data.type === 'list'){

            data.list.forEach(function(e){
              clients.add({key:e});
              var pc = createPeerConnection(localStream, e);
              pc.createOffer(function(description){gotLocalDescription.call(e, description);}, errorHandler, { 'mandatory': { 'OfferToReceiveAudio': true, 'OfferToReceiveVideo': true } });//create offer
            });

      } else if (data.type === 'add'){
          clients.add({key:from});
      } else if (data.type === 'leave'){
          clients.remove(from);
      }
  }

  var gotLocalDescription = function(description){
    var client = clients.findOne({key:this});
    client.pc.setLocalDescription(description);
    if (description.type == 'offer'){
      console.log('send offer to '+this);
    } else {
      console.log('send answer to'+this);
    }
    ws.emit('message', {to:this, data:description});
  }

  var gotIceCandidate = function(event) {
    if (event.candidate) {
      console.log('getting ice candidate', event.candidate.candidate);
      //send signal server
      var data = {
        type: 'candidate',
        label: event.candidate.sdpMLineIndex,
        id: event.candidate.sdpMid,
        candidate: event.candidate.candidate
      };
      ws.emit('message',{to:this, data:data});
    }
  }

  var gotRemoteStream = function(remoteStream){

    var keys = clients.list({attribute:{pc:remoteStream.currentTarget}});
    connection.publish('got remote stream', remoteStream.stream, keys[0]);
  };

  var createPeerConnection = function(stream, key){

    var pc = new RTCPeerConnection(servers);
    pc.addStream(stream);
    pc.onicecandidate = function(event){gotIceCandidate.call(key, event);}
    pc.onaddstream = gotRemoteStream;

    var client = clients.findOne({key:key});
    client.pc = pc;

    return pc;
  }
 
  var ioInit = function(){
    ws = io.connect('http://localhost:8080');
    ws.on('connect', function () {
        connection.publish('websocket open');
        console.log('socket open');
    });
    ws.on('message', messageHandler);
  }

  return {
    init: function(){
      console.log('[module connection] init');
      getUserMedia(constraints, function(stream) {
            console.log('video ok');
            ioInit();
            localStream = stream;
            connection.publish('local stream', stream);
      }, errorHandler);
    }
  };
}());
