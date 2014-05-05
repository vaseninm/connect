'use strict';

var WebSocket = window.WebSocket || window.MozWebSocket;

var mediator = require('mediator');
var clients = require('clients')();
mediator.installTo(clients);
mediator.installTo(connection);

connection.subscribe('websocket open', function(){
  render.init();
});

connection.subscribe('local stream', function(stream){
 render.addVideoElement(stream, 'local');
});

connection.subscribe('got remote stream', function(stream, key){
  render.addVideoElement(stream, key);
});

clients.subscribe('client remove', function(key){
    render.removeVideoElement(key);

});

$(function(){
    console.log('Страница загружена');
    connection.init(); 
});
