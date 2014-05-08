$(function(){
    var clients = {};
    var userId = null;

    var WebRTC = $.fn.WebRTC({
        onGetLocalVideo: function (url) {
            $('#local video').attr('src', url);
        },
        onServerConnect: function(socket, id, clientList) {
            userId = id;
            clients = clientList;
            WebRTC.callToAll();
        },
        onCall: function(clientId) {
            WebRTC.answer(clientId);
        }
    });


});