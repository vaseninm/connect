$(function(){
    var clients = [];
    var userId = null;

    var WebRTC = $.fn.WebRTC({
        onGetLocalVideo: function (url) {
            $('#local video').attr('src', url);
        },
        onServerConnect: function(socket, id, clientList) {
            userId = id;
            clients = clientList;
            for(i in clients) {
                if (userId !== clients[i].id) {
                    WebRTC.call(clients[i].id);
                }
            }
        },
        onCall: function(clientId) {
            WebRTC.answer(clientId);
        },
        onGetRemoteVideo: function (userId, url) {
            $('.video video:not([src]):first').attr('src', url).parent().attr('user-id', userId);
        },
        onRemoveRemoteVideo: function (userId) {
            $('.video[user-id="'+userId+'"]').removeAttr('user-id').find('video').removeAttr('src').first().load();
        }
    });


});