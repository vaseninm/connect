var express = require('express'),
  mongoose = require('mongoose'),
  log = require('lib/log')(module);

module.exports = function(app, config){

  if (app.get('env') == 'development'){
    app.use(express.logger());
  } else {
    app.use(express.logger('default'));
  }
  
  app.use(express.bodyParser());
  app.use(express.cookieParser());

  var MongoStore = require('connect-mongo')(express);

  app.use(express.session({
      secret: config.get('session:secret'),
      key: config.get('session:key'),
      cookie: config.get('session:cookie'),
      store: new MongoStore({mongoose_connection: mongoose.connection})
  }));

  app.use(require('middleware/loadUser'));

  app.use(app.router);

  //error handler
  app.use(function(err, req, res, next){
    express.errorHandler()(err, req, res, next);
  });
}
