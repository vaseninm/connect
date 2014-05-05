require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var connection = (function(clients){
  var clients = clients;

  var localStream = localStream;
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
       minWidth: 640,
       maxWidth: 960,
       minHeight: 480,
       maxHeight: 720,
       minFrameRate: 20
      },
      optional: []
    }
  };

  var errorHandler = function(error){
    console.log(error);
  }

  var messageHandler = function (message) {
      try {
          var m = JSON.parse(message.data);
          console.log('message: ', m);
          var data = m.data;
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
    ws.send(JSON.stringify({to:this, data:description}));
  }

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
      ws.send(JSON.stringify({to:this, data:data}));
    }
  }

  var gotRemoteStream = function(remoteStream){

    var keys = clients.list({attribute:{pc:remoteStream.currentTarget}});
    var client = clients.findOne({key:keys[0]});
    connection.publish('got remote stream', remoteStream.stream, keys[0]);
//    client.html = addVideoElement(remoteStream.stream, keys[0]);
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

  var init = function(){
    ws = new WebSocket('ws://' + location.hostname + ':8080');
    ws.onopen = function () {
        connection.publish('websocket open');
        console.log('socket open');
    }
    ws.onerror = errorHandler;
    ws.onmessage = messageHandler;
  }

  return {
    init: function(){
      console.log('[module connection] init');
      init();
      getUserMedia(constraints, function(stream) {
            console.log('video ok');
            localStream = stream;
            connection.publish('local stream', stream);
//            addVideoElement(stream, 'local');
      }, errorHandler);
    }
  };
}());

},{}],"O0HrNI":[function(require,module,exports){
'use strict'

function clients(){

  var _clients = {};

  var add = function(client){
    _clients[client.key] = client;
    console.log('add new client');
    console.log('clients: ', Object.keys(_clients));
    if (this.publish){
      this.publish('client add', client); 
    } 
  }

  var remove = function(key){
    if (this.publish){
      this.publish('clients prepare remove', key); 
    } 
    delete _clients[key];
    console.log('remove client: '+key);
    console.log('clients: ', Object.keys(_clients));
    if (this.publish){
      this.publish('client remove', key); 
    } 
  }

  var findOne = function(condition){
    var keys = Object.keys(_clients);

    if (typeof condition !== 'undefined'){
      if (typeof condition.key !== 'undefined'){
        keys = [condition.key];
      }
    }

    if (keys.length === 0){
      return undefined;
    } else {
      return _clients[keys[0]];
    }

  }

  //возвращает массив с доступными пользовтелями
  var list = function(condition){
    var keys = Object.keys(_clients);

      if (typeof condition !== 'undefined'){
           if (typeof condition.exclude !== 'undefined'){
        keys.splice(keys.indexOf(condition.exclude), 1);
      }
      if (typeof condition.attribute !== 'undefined'){
        var key = Object.keys(condition.attribute)[0];
        var value = condition.attribute[key];
        keys = [];
        for (var k in _clients){
          if (_clients[k].hasOwnProperty(key) && _clients[k][key] === value){
            keys.push(k);
          }
        }
      }
    }

    return keys;
  }

  return {
    add: add,
    remove: remove,
    list: list,
    findOne: findOne,
  }
}

module.exports = clients;

},{}],"clients.js":[function(require,module,exports){
module.exports=require('O0HrNI');
},{}]},{},[1])