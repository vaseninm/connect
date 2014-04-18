$(function(){
    var pc = null;
    var PeerConnection = window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
    var IceCandidate = window.mozRTCIceCandidate || window.RTCIceCandidate;
    var SessionDescription = window.mozRTCSessionDescription || window.RTCSessionDescription;
    var WebSocket = window.WebSocket || window.MozWebSocket;
    navigator.getUserMedia = navigator.getUserMedia || navigator.mozGetUserMedia || navigator.webkitGetUserMedia;
    var connection = new WebSocket('ws://127.0.0.1:1337');
    var localKey = null;
    var clients = [];

    console.log('Страница загружена');

    var connectToWebSocket = function () {
        connection.onopen = function () {
            console.log('Сокет соединение открыто');

            getLocalVideo()
        };

        connection.onerror = function (error) {
            console.log(error);
        };

        connection.onmessage = function (message) {
            try {
                var json = JSON.parse(message.data);
            } catch (e) {
                console.log('This doesn\'t look like a valid JSON: ', message.data);
                return;
            }

            if (json.type === 'new') {
                if (json.client.key === localKey) return;

                var description = json.client.description;

                clients.push(json.client);

                if (description.type === 'offer') {
                    pc.setRemoteDescription(new SessionDescription(description));
                    offer('createAnswer');
                }
                else if (description.type === 'answer') {
                    pc.setRemoteDescription(new SessionDescription(description));
                }
                else if (description.type === 'candidate') {
                    var candidate = new IceCandidate({sdpMLineIndex: description.label, candidate: description.candidate});
                    pc.addIceCandidate(candidate);
                }
            } else if(json.type === 'connect') {
                localKey = json.key;
                clients = json.list;
            } else if(json.type === 'leave'){
                $('#key'+json.client.key).remove();
                for (var i in clients) {
                    if (clients[i].key == json.client.key) {
                        clients.splice(i, 1);
                    }
                }
                clients.splice();
            }

        };
    }

    var getVideoElement = function (stream) {
        var el = $('<video></video>').attr({
            height: 200,
            videoHeight: 200,
            width: 250,
            videoWidth: 250,
            src: URL.createObjectURL(stream)
        });

        return el;
    }

    var getLocalVideo = function () {
        navigator.getUserMedia({ audio: true, video: true }, function(stream) {
            console.log('Видео разрешено');
            $('#local').append(getVideoElement(stream));

            pc = new PeerConnection(null);
            pc.addStream(stream);
            pc.onicecandidate = function(event) {
                console.log(event);
                if (event.candidate) {
                    console.log('Получен ice candiday');
                }
            };
            pc.onaddstream = function(remoteStream){
                var key = null;
                for(i in clients) {
                    if (clients[i].description.sdp == remoteStream.target.remoteDescription.sdp) {
                        key = clients[i].key;
                        break;
                    }
                }
                $('#user').clone().append(getVideoElement(remoteStream.stream)).attr('id', 'key'+key).show().appendTo('#users');
            };

            offer('createOffer');

            for (var i in clients) {
                if (clients[i].description.type === 'offer') {
                    pc.setRemoteDescription(new SessionDescription(clients[i].description));
                    offer('createAnswer');
                }
                else if (clients[i].description.type === 'answer') {
                    pc.setRemoteDescription(new SessionDescription(clients[i].description));
                }
                else if (clients[i].description.type === 'candidate') {
                    var candidate = new IceCandidate({sdpMLineIndex: clients[i].description.label, candidate: clients[i].description.candidate});
                    pc.addIceCandidate(candidate);
                }
            }
        }, function(error) {
            console.log(error);
        });
    };

    //offer('createOffer'), offer('createAnswer');
    var offer = function(type) {
        pc[type](
            function(description) {
                console.log('Офер отправлен ['+type+'].');
                if (type === 'createOffer')
                    connection.send(JSON.stringify({
                        type: 'new',
                        description: description
                    }));
            },
            function(error) { console.log(error) },
            { 'mandatory': { 'OfferToReceiveAudio': true, 'OfferToReceiveVideo': true } }
        );
    }

    connectToWebSocket();
});