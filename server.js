'use strict';

var io = require('socket.io').listen(8080);

var mediator = require('mediator');
var clients = require('clients')();
mediator.installTo(clients);

var messageHandler = function(message){

  var to = clients.findOne({key:message.to});
  var data = message.data;
  console.log('new message ('+data.type+') from '+this.id+' to '+message.to);

  if (typeof to !== 'undefined'){
    if (data.type === 'offer') {
       to.socket.send(prepareSend(data, this));
    } else if (data.type === 'answer'){
       to.socket.send(prepareSend(data, this));
    } else if (data.type === 'candidate'){
       to.socket.send(prepareSend(data, this));
    }
  }
}

var closeHandler = function(socket){

  clients.remove(socket.id);

  //send all
  clients.list().forEach(function(e){
    var other = clients.findOne({key:e});
    other.socket.send(prepareSend({
      error: 0,
      type: 'leave'
    }, request));
  });
}

//prepare for sending message
var prepareSend = function(data, socket){
  return JSON.stringify({from:socket.id, data:data});
}

var connectionHandler = function(socket){
  socket.on('message', function(message){messageHandler.call(socket, message)});
  socket.on('disconnect', function(){closeHandler(socket);});

  clients.add({
      key: socket.id,
      socket:socket
  });

  var others = clients.list({exclude: socket.id});

  socket.send(prepareSend({
    error: 0,
    type: 'list',
    list: others
  }, socket));

  others.forEach(function(e){
    var other = clients.findOne({key:e});
    other.socket.send(prepareSend({
        error: 0,
        type: 'add'}, socket)
    );
  })
}

io.on('connection', connectionHandler);
