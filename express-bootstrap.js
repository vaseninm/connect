var express = require('express');
var HttpError = require('middleware/sendHttpError').HttpError;
var mongoose = require('mongoose');

module.exports = function(app, config){

  if (app.get('env') == 'development'){
    app.use(express.logger());
  } else {
    app.use(express.logger('default'));
  }
  
  mongoose.connect(config.get('mongoose:uri'), config.get('mongoose:options'));

  app.use(express.bodyParser());
  app.use(app.router)

  //error handler
  app.use(function(err, req, res, next){
    if (typeof err == 'number') { 
      err = new HttpError(err);
    }
    if (err instanceof HttpError) {
      res.sendHttpError(err);
    } else {
      if (app.get('env') == 'development') {
        express.errorHandler()(err, req, res, next);
      } else {
        log.error(err);
        err = new HttpError(500);
        res.sendHttpError(err);
      }
    }
  });
}
