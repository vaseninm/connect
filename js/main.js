'use strict';

var pc = null;
var WebSocket = window.WebSocket || window.MozWebSocket;
var connection = null;

var errorHandler = function(error){
  console.log(error);
}

var init = function(){
  connection = new WebSocket('ws://' + location.hostname + ':8080');
  clients = window.clients();

  connectionHandlers();
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

        if (data.type === 'offer') {

            console.log('offer complete');
            pc.setRemoteDescription(new RTCSessionDescription(data));

            var client = clients.findOne({key:from});
            client.sdp = data.sdp;//add sdp
            pc.createAnswer(gotLocalDescription, errorHandler, { 'mandatory': { 'OfferToReceiveAudio': true, 'OfferToReceiveVideo': true } });//create answer

        } else if (data.type === 'answer') {

            console.log('answer complete');
            pc.setRemoteDescription(new RTCSessionDescription(data));
            var client = clients.findOne({key:from});//add sdp
            client.sdp = data.sdp

        } else if (data.type === 'candidate') {

            console.log('candidate complete');
            var candidate = new RTCIceCandidate(data);
            pc.addIceCandidate(candidate);

        } else if (data.type === 'list'){

            for (var i in data.list){
              clients.add({key:data.list[i]});
            }
            updateList(clients.list());

        } else if (data.type === 'add'){

            clients.add({key:from});
            updateList(clients.list());

        } else if (data.type === 'leave'){
            var client = clients.findOne({key:from});
            if (typeof client.html != 'undefined'){
              $(client.html).remove();
            }
            clients.remove(from);
            updateList(clients.list());
        }
    };
}

var gotLocalDescription = function(description){
  pc.setLocalDescription(description);
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

var updateList = function(list){

  $('#users').empty();
  if (list.length > 0 ){
    $('button').show();
  } else {
    $('button').hide();
  }
  for (var i in list) {
    $('<div/>', {text: list[i]}).appendTo('#users');
  }
}

var addVideoElement = function (stream, key) {
  var el = $('<video/>', {id:key, autoplay:true, controls:true}).appendTo('body')[0];
  el.src = URL.createObjectURL(stream);

  return el;
}

$(function(){

    $('button').click(function(e){
      pc.createOffer(gotLocalDescription, errorHandler, { 'mandatory': { 'OfferToReceiveAudio': true, 'OfferToReceiveVideo': true } });//create offer
      return;
  });

    console.log('Страница загружена');
    //создаем окно
    (function () {
    var constraints = {
        "audio": true,
        "video": {
          "mandatory": {

           "minWidth": 640,
           "maxWidth": 960,
           "minHeight": 480,
           "maxHeight": 720,
           "minFrameRate": 20
          },
          "optional": []
        }
      };

      var servers = {}
      servers.iceServers = [
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
      ];
      getUserMedia(constraints, function(stream) {

            console.log('Видео разрешено');
            addVideoElement(stream, 'local');

            pc = new RTCPeerConnection(servers);
            pc.addStream(stream);
            pc.onicecandidate = gotIceCandidate;
            pc.onaddstream = gotRemoteStream;

            init();

        }, errorHandler);
    })();

});
