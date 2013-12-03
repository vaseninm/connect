var express = require('express'),
    mongoose = require('mongoose'),
    redis = require('redis'),
    log = require('lib/log')(module),
    passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    User = mongoose.model('User');

module.exports = function (app, config) {

  if (app.get('env') == 'development') {
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
    store: new MongoStore({db: 'session'})
  }));

  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(new LocalStrategy(
      function (username, password, done){
        User.findOne({name: username}, function (err, user) {
          if (err) {
            return done(err);
          }
          if (!user) {
            return done(null, false, {message: 'Incorrect name'});
          }
          if (!user.checkPassword(password)) {
            return done(null, false, {message: 'Incorrect password'});
          }
          return done(null, user);
        });
      }
  ));

  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });

//  app.use(require('middleware/loadUser'));

  app.use(app.router);

  //error handler
  app.use(function (err, req, res, next) {
    express.errorHandler()(err, req, res, next);
  });
};
