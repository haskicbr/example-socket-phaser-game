var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var lastSidePoint = "";

const allPlayers = {};

io.on('connection', function (socket) {

    console.info('New client connected (id=' + socket.id + ').');

    handshakeData = socket.request;
    query = handshakeData._query;

    io.emit('load-player', allPlayers);

    socket.on('clickPoint', function (params) {

        if(lastSidePoint !== params.side) {

            lastSidePoint = params.side;

            io.emit('clickPoint', params);
        } else {
            socket.emit('msg', {
                msg : 'ход противника'
            })
        }
    });

    socket.on('disconnect', function () {

    });
});

http.listen(777, function () {
    console.log('listening on *:777');
});