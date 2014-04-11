$(function(){
    var pc = null;
    var PeerConnection = window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
    var IceCandidate = window.mozRTCIceCandidate || window.RTCIceCandidate;
    var SessionDescription = window.mozRTCSessionDescription || window.RTCSessionDescription;
    var WebSocket = window.WebSocket || window.MozWebSocket;
    navigator.getUserMedia = navigator.getUserMedia || navigator.mozGetUserMedia || navigator.webkitGetUserMedia;
    var connection = new WebSocket('ws://127.0.0.1:1337');

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

            var description = json.newClient.description;

            if (description.type === 'offer') {
                pc.setRemoteDescription(new SessionDescription(description));
                offer('createAnswer');
            }
            else if (description.type === 'answer') {
                pc.setRemoteDescription(new SessionDescription(description));
            }
            else if (description.type === 'candidate') {
                var candidate = new IceCandidate({sdpMLineIndex: message.label, candidate: message.candidate});
                pc.addIceCandidate(candidate);
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
                $('#user').clone().append(getVideoElement(remoteStream.stream)).show().appendTo('#users');
            };

            offer('createOffer');
        }, function(error) {
            console.log(error);
        });
    };

    //offer('createOffer'), offer('createAnswer');
    var offer = function(type) {
        pc[type](
            function(description) {
                console.log('Офер отправлен ['+type+'].');
                connection.send(JSON.stringify(description));
            },
            function(error) { console.log(error) },
            { 'mandatory': { 'OfferToReceiveAudio': true, 'OfferToReceiveVideo': true } }
        );
    }

    connectToWebSocket();
});