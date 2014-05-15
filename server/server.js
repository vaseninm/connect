var _ = require('underscore');
var io = require('socket.io').listen(1488, {
	'log level': 2,
	'transports': ['websocket'],
	'browser client': false
});
var webRTC = require('./webrtc');

var clients = [];

io.sockets.on('connection', function (socket) {

	webRTC.attachSocket(socket);

	clients.push(socket.id);

 	socket.emit('sendInfoToNewClient', {
		id: socket.id,
		clients: _.without(clients, socket.id)
	});

	socket.broadcast.emit('sendInfoAboutConnectedClient', {
		client: socket.id
	});

	socket.on('disconnect', function () {
		socket.broadcast.emit('sendInfoAboutDisconnectedClient', {
			client: socket.id
		});

		clients = _.without(clients, socket.id);
	});

});