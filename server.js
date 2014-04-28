'use strict';

var WebSocketServer = require('websocket').server;
var http = require('http');

var server = http.createServer(function(request, response) {
    // process HTTP request. Since we're writing just WebSockets server
    // we don't have to implement anything.
});

var clients = require('./clients')();

server.listen(8080, function() {});

// create the server
var wsServer = new WebSocketServer({
    httpServer: server
});

// WebSocket server
wsServer.on('request', function(request) {
    request.on('requestAccepted', requestAcceptedHandler);
    request.accept(null, request.origin);
});

var requestAcceptedHandler = function(connection){
  var request = this;

  //compare for sending message
  var compareSend = function(message){
    return JSON.stringify({from:request.key, message:message})
  }

  var messageHandler = function(message){

    if (message.type !== 'utf8') {
       console.warn('Message [' + message + '] not valid.');
       return;
    }
    message = JSON.parse(message.utf8Data);

    var other = clients.findOne({exclude:request.key});
    if (typeof other === 'undefined'){
      console.log('you once');
      return;
    }

    if (message.type === 'offer') {
       other.connection.send(compareSend(message));
       console.log('send offer');
    } else if (message.type === 'answer'){
       other.connection.send(compareSend(message));
       console.log('send answer');
    } else if (message.type === 'candidate'){
       other.connection.send(compareSend(message));
       console.log('send candidate');
    }
  }

  var closeHandler = function(){

    clients.remove(request.key);

    var others = clients.list();
    if (others.length == 0){
      console.log('you once');
      return;
    }

    //send all
    for (var key in others){
      var other = clients.findOne({key:others[key]});
      console.log('others: ', others);
      other.connection.send(compareSend({
        error: 0,
        type: 'leave'
      }));
    }
  }

  connection.on('message', messageHandler);
  connection.on('close', closeHandler);

  clients.add({
      key: this.key,
      connection:connection
  });

  connection.send(compareSend({
    error: 0,
    type: 'list',
    list: clients.list({exclude:request.key})
  }));

  var other = clients.findOne({exclude: request.key});
  if (!other){
    console.log('you once');
  } else {
    other.connection.send(compareSend({
        error: 0,
        type: 'add'})
    );
  }
}


