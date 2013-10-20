var express = require('express');
var http = require('http');
var config = require('config');
var log = require('lib/log')(module);

var app = express();

require('express-bootstrap')(app, config);

require('routes')(app);

http.createServer(app).listen(config.get('port'), function(){
  log.info('Express server listening on port ' + config.get('port'));
});
