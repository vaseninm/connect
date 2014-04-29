'use strict';

var WebSocketServer = require('websocket').server;
var http = require('http');

var server = http.createServer(function(request, response) {
    // process HTTP request. Since we're writing just WebSockets server
    // we don't have to implement anything.
});

var clients = require('clients')();

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

var messageHandler = function(message){

  if (message.type !== 'utf8') {
     console.warn('Message [' + message + '] not valid.');
     return;
  }
  message = JSON.parse(message.utf8Data);

  var to = clients.findOne({key:message.to});
  console.log('new message ('+message.type+') from '+this.key+' to '+message.to);

  if (typeof to !== 'undefined'){
    if (message.type === 'offer') {
       to.connection.send(prepareSend(message, this));
    } else if (message.type === 'answer'){
       to.connection.send(prepareSend(message, this));
    } else if (message.type === 'candidate'){
       to.connection.send(prepareSend(message, this));
    }
  }
}

var closeHandler = function(){
  var request = this;

  clients.remove(this.key);

  //send all
  clients.list().forEach(function(e){
    var other = clients.findOne({key:e});
    other.connection.send(prepareSend({
      error: 0,
      type: 'leave'
    }, request));
  });
}

//compare for sending message
var prepareSend = function(message, request){
  return JSON.stringify({from:request.key, message:message})
}

var requestAcceptedHandler = function(connection){
  var request = this;

  connection.on('message', function(message){messageHandler.call(request, message)});
  connection.on('close', function(){closeHandler.call(request)});

  clients.add({
      key: this.key,
      connection:connection
  });

  connection.send(prepareSend({
    error: 0,
    type: 'list',
    list: clients.list({exclude:request.key})
  }, request));

  var others = clients.list({exclude: request.key});
  others.forEach(function(e){
    var other = clients.findOne({key:e});
    other.connection.send(prepareSend({
        error: 0,
        type: 'add'}, request)
    );
  })
}
