(function( $ ){

    var defaults = {
        host: 'localhost',
        port: '1488',
        secure: false,
        onGetLocalVideo: function (url) {},
        onCall: function (clientId) {},
        onServerConnect: function (connection, id, clients) {},
        onGetRemoteVideo: function (clientId, url) {},
        onRemoveRemoteVideo: function (clientId) {},
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

        var socket = null;
        var localStream = null;
        var clientList = {};

        /* Инициализация */
        navigator.getUserMedia({ audio: true, video: true }, function(stream) {
            console.log('Получено лоакальное видео');

            localStream = stream;

            options.onGetLocalVideo(URL.createObjectURL(stream));
        }, function(error) {
            console.log('Получили ошибку', error);
        });

        socket = io.connect( ( options.secure ? 'https' : 'http' ) + '://' + options.host + ':' + options.port);

        socket.on('connect', function () {
            console.log('Подключились к сокет серверу');

            socket.on('sendInfoToNewClient', function(data) {
                console.log('Получен свои данные клиента', data);
                options.onServerConnect(socket, data.id, data.clients);
            });

            socket.on('sendInfoAboutNewClient', function(data) {
                console.log('Получен чужие данные клиента', data);
            });

            socket.on('sendInfoAboutDisconnectedClient', function(data) {
                console.log('Отключен клиент', data);
                options.onRemoveRemoteVideo(data.id);
            });

            socket.on('offerFromClient', function (data) {
                console.log('Получен', data.type);

                var pc = getPeerConnection(data.id);

                pc.setRemoteDescription(new SessionDescription(data.description), function() {
                    if (data.type === 'offer') {
                        options.onCall(data.id);
                    }
                }, function(error) {
                    console.log('Возникла ошибка', error);
                });
            })
        });

        /* Методы */
        var object = {
            call: function (clientId) {
                sendOffer(clientId, 'offer');
            },
//            callToAll: function () {
//                sendOffer(null, 'offer');
//            },
            answer: function (clientId) {
                sendOffer(clientId, 'answer');
            }
        };

        /* Приватные функции */
        var sendOffer = function (clientId, type) {
            if (type === 'offer') {
                var fn = 'createOffer';
            } else if (type === 'answer') {
                var fn = 'createAnswer';
            } else {
                throw new Error();
            }

            console.log('Вызван ', fn);

            var pc = getPeerConnection(clientId);

            pc[fn](function (description) {
                    pc.setLocalDescription(description, function() {
                        console.log('Локал дескрипшн установлен');
                    }, function(error) {
                        console.log('Возникла ошибка', error);
                    });

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

        var getPeerConnection = function (clientId) {
            if (! clientList[clientId]) {

                var pc = new PeerConnection(null);

                pc.addStream(localStream);
                pc.onaddstream = function (event) {
                    console.log('Получен удаленый стрим');

                    var clientId = getClientIdByPeerConnection(event.currentTarget);
                    var url = URL.createObjectURL(event.stream);

                    options.onGetRemoteVideo(clientId, url);
                };
                pc.onicecandidate = function (iceCandidate) {
                    console.log('Получен айс кандидат', iceCandidate);
                };

                clientList[clientId] = pc;
            }

            return clientList[clientId];
        }

        var getClientIdByPeerConnection = function(pc) {
            for (id in clientList) {
                if (clientList[id] === pc) {
                    return id;
                }
            }

            return null;
        }

        return object;
    };
})( jQuery );