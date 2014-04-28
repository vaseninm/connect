  $(function(){

    $('button').click(function(e){
      pc.createOffer(gotLocalDescription, errorHandler, { 'mandatory': { 'OfferToReceiveAudio': true, 'OfferToReceiveVideo': true } });//create offer
      return;
    });

    console.log('Страница загружена');

    var pc = null;
    var WebSocket = window.WebSocket || window.MozWebSocket;

//    var clients = window.clients();

    var connection = new WebSocket('ws://' + location.hostname + ':8080');

    connection.onopen = function () {
        console.log('Сокет соединение открыто');
        getLocalVideo();
    };

    connection.onerror = errorHandler;

    connection.onmessage = function (message) {
        try {
            var data = JSON.parse(message.data);
            console.log(data);
        } catch (e) {
            console.log('This doesn\'t look like a valid JSON: ', message.data);
            return;
        }

            if (data.type === 'offer') {
                console.log('offer complete');
                pc.setRemoteDescription(new RTCSessionDescription(data));
                pc.createAnswer(gotLocalDescription, errorHandler, { 'mandatory': { 'OfferToReceiveAudio': true, 'OfferToReceiveVideo': true } });//create answer
            } else if (data.type === 'answer') {
                console.log('answer complete');
                pc.setRemoteDescription(new RTCSessionDescription(data));
            } else if (data.type === 'candidate') {
                console.log('candidate complete');
                var candidate = new RTCIceCandidate(data);
                pc.addIceCandidate(candidate);
            }
//            else if (data.type === 'add'){
//                clients.add({key:data.key});
//                $('button').show();
//            } else if (data.type === 'leave'){
//                clients.remove(data.key);
//            }
    };

    var errorHandler = function(error){
      console.log(error);
    }

    var addVideoElement = function (stream, id) {

      var el = $('<video/>', {id:id, autoplay:true, muted:true}).appendTo('body')[0];
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
//        var key = null;
//        for(i in clients) {
//            if (clients[i].description.sdp == remoteStream.target.remoteDescription.sdp) {
//                key = clients[i].key;
//                break;
//            }
//        }
        addVideoElement(remoteStream.stream, 'user-' + 1)
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
