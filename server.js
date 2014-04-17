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
        type: 'connect',
        key: request.key,
        list: clients
    }));

    connection.on('message', function(message) {
        if (message.type !== 'utf8') {
            console.warn('Message [' + message + '] not valid.');
            return;
        }

        message = JSON.parse(message.utf8Data);

        if (message.type === 'new') {
            if (clients.length >= 10) {
                this.send(JSON.stringify({
                    error: 1
                }));
                return;
            }

            var client = {
                description: message.description,
                key: request.key
            };

            clients.push(client);

            wsServer.broadcast(JSON.stringify({
                error: 0,
                type: 'new',
                client: client
            }));

            console.log(clients.length);
        } else if (message.action === 'get') {
            this.send(JSON.stringify({
                error: 0,
                type: 'list',
                list: clients
            }));
        }
    });

    connection.on('close', function() {
        for (var i in clients) {
            if (clients[i].key == request.key) {
                wsServer.broadcast(JSON.stringify({
                    error: 0,
                    type: 'leave',
                    client: clients[i]
                }));

                clients.splice(i, 1);
            }
        }

        console.log('Отключен клиент [' + request.key + '].');
    });
});