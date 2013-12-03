var mongoose = require('mongoose'),
  HttpError = require('lib/httpError'),
  User = mongoose.model('User'),
  async = require('async'),
  passport = require('passport');

exports.login = passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login' }
);

exports.logout = function(req, res){
  req.logout();
  res.redirect('/login');
};

exports.register = function(req, res, next){
  if (!req.body.name || !req.body.email || !req.body.password){
    return next(new Error('missed parameter name or email or password', 500));
  }
  var user = new User({name: req.body.name, email: req.body.email, password: req.body.password});
  user.save(function(err){
    if (err) return next(err);
    req.login(user, function(err){
      if (err) return next(err);
      res.send(req.user);
    });
  });
};
