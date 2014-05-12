(function( $ ){

    var defaults = {
        onGetLocalVideo: function (url) {},
        onCall: function (clientId) {},
        onServerConnect: function (connection, id, clients) {},
        onGetRemoteVideo: function (clientId, url) {},
        onGetIncommingIceCandidate: function (clientId, iceCandidate) {},
        onGetOutgoingIceCandidate: function (clientId, iceCandidate) {},
        onError: function (code, text) {}
    };

    $.fn.WebRTC = function(params) {

        /* Переменные */
        var options = $.extend({}, defaults, params);
        var PeerConnection = window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
        var IceCandidate = window.mozRTCIceCandidate || window.RTCIceCandidate;
        var SessionDescription = window.mozRTCSessionDescription || window.RTCSessionDescription;
        navigator.getUserMedia = navigator.getUserMedia || navigator.mozGetUserMedia || navigator.webkitGetUserMedia;
        var pc = new PeerConnection(null);
        var localStream = null;
        var socket = null;

        /* Инициализация */
        navigator.getUserMedia({ audio: true, video: true }, function(stream) {
            var url = URL.createObjectURL(stream);

            localStream = stream;
            options.onGetLocalVideo(url);

            pc = new PeerConnection(null);
            pc.addStream(stream);
            pc.onaddstream = function (event) {
                console.log(event);
            };
            pc.onicecandidate = function () {

            };
        }, function(error) {
            console.log(error);
        });

        socket = io.connect('http://localhost:1488');
        socket.on('connect', function () {
            socket.on('sendInfoToNewClient', function(data) {
                options.onServerConnect(socket, data.id, data.clients);
            });

            socket.on('offerFromClient', function (data) {
                pc.setRemoteDescription(new SessionDescription(data.description));
                if (data.type === 'offer') {
                    options.onCall(data.id);
                }
            })
        });

        /* Методы */
        var object = {
            call: function (clientId) {
                sendOffer(clientId, 'offer');
            },
            callToAll: function () {
                sendOffer(null, 'offer');
            },
            answer: function (clientId) {
                sendOffer(clientId, 'answer');
            }
        };

        /* Приватные функции */
        var sendOffer = function (clientId, type) {
            pc.createOffer(function (description) {
                    pc.setLocalDescription(description);
                    socket.emit('offerToClient', {
                        id: clientId,
                        type: type,
                        description: description
                    });
                }, function(error) {
                    console.log(error)
                },
                { mandatory: { OfferToReceiveAudio: true, OfferToReceiveVideo: true } }
            );
        }

        return object;
    };
})( jQuery );