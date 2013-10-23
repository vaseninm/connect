//var http = require('http');
//var config = require('config');
//var log = require('lib/log')(module);
//var io = require('socket.io').listen(4000);

var redisRequire = require("redis");
var redis = redisRequire.createClient();
redis.on('ready', function() {
    console.log(arguments);
    redis.quit();
});
