'use strict';

var WebSocket = window.WebSocket || window.MozWebSocket;

var connection = null;

var localStream = null;

var errorHandler = function(error){
  console.log(error);
}

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
       minWidth: 640,
       maxWidth: 960,
       minHeight: 480,
       maxHeight: 720,
       minFrameRate: 20
      },
      optional: []
    }
  };

var createPeerConnection = function(stream, key){

  var pc = new RTCPeerConnection(servers);
  pc.addStream(stream);
  pc.onicecandidate = gotIceCandidate;
  pc.onaddstream = gotRemoteStream;

  var client = clients.findOne({key:key});
  client.pc = pc;

  return pc;
}

var clientsModule = require('clients');

var clients = clientsModule();

var init = function(){
  connection = new WebSocket('ws://' + location.hostname + ':8080');
  connectionHandlers();
  clientsHandler();
}

var connectionHandlers = function(){

  connection.onopen = function () {
        console.log('Сокет соединение открыто');
    };

  connection.onerror = errorHandler;

  connection.onmessage = function (message) {
        try {
            var m = JSON.parse(message.data);
            console.log('message:', m);
            var data = m.message;
            var from = m.from;

        } catch (e) {
            console.log('This doesn\'t look like a valid JSON: ', message.data);
            return;
        }

        if (data.type === 'offer' || data.type === 'answer' || data.type === 'candidate'){
          var client = clients.findOne({key:from});
        }

        if (data.type === 'offer') {
            console.log('offer complete');

            var newPc = createPeerConnection(localStream, from);
            newPc.setRemoteDescription(new RTCSessionDescription(data));
            client.sdp = data.sdp;//add sdp
            newPc.createAnswer(gotLocalDescription, errorHandler, { 'mandatory': { 'OfferToReceiveAudio': true, 'OfferToReceiveVideo': true } });//create answer

        } else if (data.type === 'answer') {
            console.log('answer complete');

            client.pc.setRemoteDescription(new RTCSessionDescription(data));
            client.sdp = data.sdp

        } else if (data.type === 'candidate') {
            console.log('candidate complete');

            var candidate = new RTCIceCandidate(data);
            client.pc.addIceCandidate(candidate);

        } else if (data.type === 'list'){
            for (var i in data.list){
              clients.add({key:data.list[i]});
            }

            if (data.list.length){
              var pc = createPeerConnection(localStream, data.list[0]);
              pc.createOffer(gotLocalDescription, errorHandler, { 'mandatory': { 'OfferToReceiveAudio': true, 'OfferToReceiveVideo': true } });//create offer
            }
          } else if (data.type === 'add'){
              clients.add({key:from});
          } else if (data.type === 'leave'){
              clients.remove(from);
          }
      };
  }

var clientsHandler = function(){

  var updateList = function(list){

    var $userCount = $('#usersCount');
    $userCount.empty();
    if (list.length){
      $userCount.html('<h2>Пользователей: <span style="color:red">'+list.length+'</span></h2>');
    }

    $('#users').empty();
    for (var i in list) {
     $('<div/>', {text: list[i]}).appendTo('#users');
    }
  }

  clients.event.on('clients prepare remove', function(client){
      if (typeof client.html != 'undefined'){
        $(client.html).remove();
      }
    });

  clients.event.on('clients add',function(){
      updateList(clients.list());
  });

  clients.event.on('clients remove', function(){
      updateList(clients.list());
  });
}

var gotLocalDescription = function(description){
  var client = clients.findOne();
  client.pc.setLocalDescription(description);
  if (description.type == 'offer'){
    console.log('send offer');
  } else {
    console.log('send answer');
  }
  connection.send(JSON.stringify(description));
}

var gotRemoteStream = function(remoteStream){
  var keys = clients.list({attribute:{sdp:remoteStream.target.remoteDescription.sdp}});
  var client = clients.findOne({key:keys[0]});
  client.html = addVideoElement(remoteStream.stream, keys[0]);
};

var gotIceCandidate = function(event) {
    if (event.candidate) {
      console.log('getting ice candidate');
      //send signal server
      var data = {
        type: 'candidate',
        label: event.candidate.sdpMLineIndex,
        id: event.candidate.sdpMid,
        candidate: event.candidate.candidate
      };
      connection.send(JSON.stringify(data));
    }
};

var addVideoElement = function (stream, key) {
  var o = {id:key, autoplay:true, controls:true};
  if (key == 'local'){
    o.muted = true;
  }
  var el = $('<video/>', o).appendTo('body')[0];
  el.src = URL.createObjectURL(stream);

  return el;
}

$(function(){

    console.log('Страница загружена');
    //создаем окно
    (function () {

      getUserMedia(constraints, function(stream) {
            console.log('Видео разрешено');

            localStream = stream;

            addVideoElement(stream, 'local');

            init();

        }, errorHandler);
    })();

});
