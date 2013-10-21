var http = require('http');
var config = require('config');
var log = require('lib/log')(module);
var io = require('socket.io').listen(4000);

