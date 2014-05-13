var _ = require('underscore');
var io = require('socket.io').listen(1488);
io.set('log level', 2);

var clients = {}; // {id: {id:},}


io.sockets.on('connection', function (socket) {

    clients[socket.id] = {
        id: socket.id
    };

    socket.emit('sendInfoToNewClient', {
        id: socket.id,
        clients: toOutputList()
    });

    socket.broadcast.emit('sendInfoAboutNewClient', {
        client: toOutputList(id)
    });

    socket.on('offerToClient', function(data) {
        if (data.id) {
            io.sockets.sockets[data.id].emit('offerFromClient', {
                id: socket.id,
                type: data.type,
                description: data.description
            })
        } else {
            socket.broadcast.emit('offerFromClient', {
                id: socket.id,
                type: data.type,
                description: data.description
            })
        }
    });

    socket.on('disconnect', function () {
        delete clients[socket.id];

        socket.broadcast.emit('sendInfoAboutDisconnectedClient', {
            id: socket.id
        });
    });

    /* Приватные методы */
    function toOutputList(requireId) {
        var outputClientList = [];

        var i = 0;

        for (id in clients) {
            outputClientList[i] = _.clone(clients[id]);
            outputClientList[i].num = ++i;

            if (requireId) return outputClientList.pop();
        }

        return outputClientList;
    }
});