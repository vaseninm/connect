'use strict';

  $(function(){

    $('button').click(function(e){
      pc.createOffer(gotLocalDescription, errorHandler, { 'mandatory': { 'OfferToReceiveAudio': true, 'OfferToReceiveVideo': true } });//create offer
      return;
    });

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

    console.log('Страница загружена');

    var pc = null;
    var WebSocket = window.WebSocket || window.MozWebSocket;

    window.clients = window.clients();

    var connection = new WebSocket('ws://' + location.hostname + ':8080');

    connection.onopen = function () {
        console.log('Сокет соединение открыто');
        getLocalVideo();
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

    var errorHandler = function(error){
      console.log(error);
    }

    var addVideoElement = function (stream, key) {

      var el = $('<video/>', {id:key, autoplay:true, muted:true}).appendTo('body')[0];
      el.src = URL.createObjectURL(stream);

      return el;
    }

    //создаем окно и оптравляем offer
    var getLocalVideo = function () {

      var contraints = {
        video: {
          mandatory: {
           minWidth: 640,
           maxWidth: 960,
           minHeight: 480,
           maxHeight: 720,
           minFrameRate: 20
          }
        },
        audio: true
      };
      getUserMedia(contraints, function(stream) {

            console.log('Видео разрешено');
            addVideoElement(stream, 'local');

            pc = new RTCPeerConnection(null);
            pc.addStream(stream);
            pc.onicecandidate = gotIceCandidate;
            pc.onaddstream = gotRemoteStream; 

/*

            for (var i in clients) {
                if (clients[i].description.type === 'offer') {
                    pc.setRemoteDescription(new RTCSessionDescription(clients[i].description));
                    offer('createAnswer');
                }
                else if (clients[i].description.type === 'answer') {
                    pc.setRemoteDescription(new RTCSessionDescription(clients[i].description));
                }
                else if (clients[i].description.type === 'candidate') {
                    var candidate = new RTCIceCandidate({sdpMLineIndex: clients[i].description.label, candidate: clients[i].description.candidate});
                    pc.addIceCandidate(candidate);
                }
            } 
*/
        }, errorHandler);
    };

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
        console.log(event);
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

  });
