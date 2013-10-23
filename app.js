var express = require('express'),
  config = require('config'),
  http = require('http'),
  fs = require('fs'),
  mongoose = require('mongoose'),
  log = require('lib/log')(module);

//db connection
mongoose.connect(config.get('mongoose:uri'), config.get('mongoose:options'));

//bootstrap models
var models_path = __dirname + '/models';
fs.readdirSync(models_path).forEach(function (file) {
  if (~file.indexOf('.js')) require(models_path + '/' + file);
});

var app = express();

require('express-bootstrap')(app, config);

require('routes')(app);

http.createServer(app).listen(config.get('port'), function(){
  log.info('Express server listening on port ' + config.get('port'));
});
