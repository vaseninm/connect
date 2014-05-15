$(function () {
	var clients = [];
	var userId = null;

	var socket = io.connect('http://' + location.hostname + ':1488', {
		'try multiple transports': false
	});

	socket.on('connect', function () {
		console.log('Подключились к сокет серверу');

		socket.on('sendInfoToNewClient', function (data) {
			console.log('Ваш id', data.id);

			userId = data.id;
			clients = data.clients;
		});

		socket.on('sendInfoAboutConnectedClient', function (data) {
			console.log('Подлючен клиент', data.client);
		});

		socket.on('sendInfoAboutDisconnectedClient', function (data) {
			console.log('Отключен клиент', data.client);
			clients = _.without(clients, data.client);
			WebRTC.disconnect(data.client);
			$('.video[user-id="' + data.client + '"]').removeAttr('user-id').find('video').removeAttr('src').first().load();
		});

		socket.on('disconnect', function() {
			console.log('Cоединение прервано');
		});

		var WebRTC = $.fn.WebRTC(socket, {
			"video": {
				"minWidth": "120",
				"minHeight": "90",
				"maxWidth": "200",
				"maxHeight": "150"
			},
			onGetLocalVideo: function (url) {
				$('#local video').attr('src', url);

				for (i in clients) {
					WebRTC.call(clients[i]);
				}
			},
			onCall: function (clientId) {
				WebRTC.answer(clientId);
			},
			onGetRemoteVideo: function (userId, url) {
				$('.video video:not([src]):first').attr('src', url).parent().attr('user-id', userId);
			}
		});

	});

});