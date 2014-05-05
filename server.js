'use strict';

var WebSocketServer = require('websocket').server;
var http = require('http');

var server = http.createServer(function(request, response) {
    // process HTTP request. Since we're writing just WebSockets server
    // we don't have to implement anything.
});

var mediator = require('mediator');

var clients = require('clients')();

mediator.installTo(clients);

var winston = require('winston');
var transports = [
  new winston.transports.Console({
    colorize:true,
    level:'info'
  }),
  new winston.transports.File({
    filename: 'debug.log', 
    level:'info'
  })
];

var log = new winston.Logger({transports:transports});

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

  message = prepareGet(message);
  if (typeof message === 'undefined'){
    return;
  }

  var to = clients.findOne({key:message.to});
  var data = message.data;
  log.info('new message ('+data.type+') from '+this.key+' to '+message.to);

  if (typeof to !== 'undefined'){
    if (data.type === 'offer') {
       to.connection.send(prepareSend(data, this));
    } else if (data.type === 'answer'){
       to.connection.send(prepareSend(data, this));
    } else if (data.type === 'candidate'){
       to.connection.send(prepareSend(data, this));
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

//prepare get message
var prepareGet = function(message){

 if (message.type !== 'utf8') {
     log.error('Message [' + message + '] not valid.');
     return undefined;
  }
  return JSON.parse(message.utf8Data);
}

//prepare for sending message
var prepareSend = function(data, request){
  return JSON.stringify({from:request.key, data:data})
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
