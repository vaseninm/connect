'use strict';

var WebSocket = window.WebSocket || window.MozWebSocket;

var mediator = require('mediator');
var clients = require('clients')();
mediator.installTo(clients);
mediator.installTo(connection);

connection.subscribe('local stream', function(stream){
 render.addVideoElement(stream, 'local');
});

connection.subscribe('got remote stream', function(stream, key){
  render.addVideoElement(stream, key);
});

clients.subscribe('client add',function(){
    render.updateList(clients.list());
});

clients.subscribe('client remove', function(key){
    render.updateList(clients.list());
    $(document.getElementById(key)).remove();
});

$(function(){
    console.log('Страница загружена');
    connection.init(); 
});
