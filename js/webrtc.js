(function( $ ){

    var defaults = {
        host: 'localhost',
        port: '1488',
        secure: false,
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

        var socket = null;
        var pc = new PeerConnection(null);

        /* Инициализация */
        navigator.getUserMedia({ audio: true, video: true }, function(stream) {
            var url = URL.createObjectURL(stream);

            console.log('Получено лоакальное видео');

            pc.addStream(stream);
            pc.onaddstream = function (event) {
                console.log(event);
                console.log('Получен удаленый стрим');
            };
            pc.onicecandidate = function (iceCandidate) {
                console.log('Получен айс кандидат', iceCandidate);
            };

            options.onGetLocalVideo(url);
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
            });

            socket.on('offerFromClient', function (data) {
                console.log('Получен ', data.type);

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
            callToAll: function () {
                sendOffer(null, 'offer');
            },
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

        return object;
    };
})( jQuery );