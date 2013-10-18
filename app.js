var express = require('express');
var path = require('path');
var http = require('http');
var config = require('config');
var log = require('lib/log')(module);

var app = express();

http.createServer(app).listen(config.get('port'), function(){
  log.info('Express server listening on port ' + config.get('port'));
});

app.use(function(err, req, res, next){
  if (app.get('env') == 'development'){
    var errorHandler = express.errorHandler();
    errorHandler(err, req, res, next);
  } else {
    res.send(500);
  }
});
