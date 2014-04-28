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

  var messageHandler = function(message){

    if (message.type !== 'utf8') {
       console.warn('Message [' + message + '] not valid.');
       return;
    }
    message = JSON.parse(message.utf8Data);

    var other = clients.findOne(request.key);
    console.log(clients.list());
    console.log('exclude '+request.key);
    if (typeof other === 'undefined'){
      console.log('you once');
      return;
    }

    console.log('my key: '+request.key+'\n'+' other key: '+other.key);

    if (message.type === 'offer') {
       other.connection.send(JSON.stringify(message));
       console.log('send offer');
    } else if (message.type === 'answer'){
       other.connection.send(JSON.stringify(message));
       console.log('send answer');
    } else if (message.type === 'candidate'){
       other.connection.send(JSON.stringify(message));
       console.log('send candidate');
    }
  }

  var closeHandler = function(){

    clients.remove(request.key);
    console.log('delete: '+request.key);

//    var other = clients.list(request.key, true);
//    if (!other){
//      console.log('you once');
//      return;
//    }

//    console.log('my key: '+request.key+'\n'+' other key: '+other.key);
    //send all
//    other.connection.send(JSON.stringify({
//        error: 0,
//        type: 'leave',
//        key: request.key
//    }));
  }

  connection.on('message', messageHandler);
  connection.on('close', closeHandler);

  clients.add({
      key: this.key,
      connection:connection
  });

//  var other = clients.list(request.key, true);
//  if (!other){
//
//  }
//  console.log('my key: '+request.key+'\n'+' other key: '+other.key);

//  other.connection.send(JSON.stringify({
//      error: 0,
//      type: 'add',
//      key: request.key
//   }));
}


