$(function(){
    var clients = [];
    var userId = null;

    var WebRTC = $.fn.WebRTC({
        onGetLocalVideo: function (url) {
            $('#local video').attr('src', url);
            for(i in clients) {
                WebRTC.call(clients[i].id);
            }
            WebRTC.callToAll();
        },
        onServerConnect: function(socket, id, clientList) {
            userId = id;
            clients = clientList;
        },
        onCall: function(clientId) {
            WebRTC.answer(clientId);
        }
    });


});