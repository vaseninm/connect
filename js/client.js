$(function(){
    var pc = null;
    var PeerConnection = window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
    var IceCandidate = window.mozRTCIceCandidate || window.RTCIceCandidate;
    var SessionDescription = window.mozRTCSessionDescription || window.RTCSessionDescription;
    var WebSocket = window.WebSocket || window.MozWebSocket;
    navigator.getUserMedia = navigator.getUserMedia || navigator.mozGetUserMedia || navigator.webkitGetUserMedia;
    var connection = new WebSocket('ws://' + location.hostname + ':1337');


});