var io = require('socket.io').listen(1488);

var clients = {}; // {id: {id:},}


io.sockets.on('connection', function (socket) {

    var id = socket.id;

    clients[id] = {
        id: id
    };

    var outputClientList = [];

    var i = 0;
    for (id in clients) {
        outputClientList[id] = clients;
        outputClientList[id].num = i++;
    }

    socket.emit('sendInfoToNewClient', {
        id: id,
        clients: outputClientList
    });

    socket.broadcast.emit('newClient', {
        client: outputClientList[i]
    });

    socket.on('offerToClient', function(data) {
        if (data.id) {
            socket.sockets[data.id].emit('offerFromClient', {
                id: clients[data.id],
                type: data.type,
                description: data.description
            })
        } else {
            socket.broadcast.emit('offerFromClient', {
                id: clients[data.id],
                type: data.type,
                description: data.description
            })
        }
    });
});