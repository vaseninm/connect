var WebSocketServer = require('websocket').server;
var http = require('http');

var server = http.createServer(function(request, response) {
    // process HTTP request. Since we're writing just WebSockets server
    // we don't have to implement anything.
});
server.listen(1337, function() { });

// create the server
wsServer = new WebSocketServer({
    httpServer: server
});

var clients = [];

// WebSocket server
wsServer.on('request', function(request) {
    var connection = request.accept(null, request.origin);

    console.log('Подключен клиент ['+ request.key +'].');

    connection.send(JSON.stringify({
        error: 0,
        key: request.key
    }));

    connection.on('message', function(message) {
        if (message.type !== 'utf8') {
            console.warn('Message [' + message + '] not valid.');
            return;
        }

        if (clients.length >= 10) {
            this.send(JSON.stringify({
                error: 1
            }));
            return;
        }

        var client = {
            description: JSON.parse(message.utf8Data),
            key: request.key
        };

        clients.push(client);

        wsServer.broadcast(JSON.stringify({
            error: 0,
            newClient: client
        }));

        console.log(clients.length);
    });

    connection.on('close', function() {
        for (i in clients) {
            if (clients[i].key == request.key) {
                clients.splice(i, 1);
            }
        }
        console.log('Отключен клиент [' + request.key + '].');
        console.log(clients.length);

    });
});