var mongoose = require('mongoose'),
  HttpError = require('lib/httpError'),
  User = mongoose.model('User'),
  async = require('async'),
  passport = require('passport');

exports.login = function(req, res) {
    passport.authenticate('local', { successRedirect: '/',
        failureRedirect: '/login' });
}

  /*
  async.waterfall([
    function(callback){
        User.findOne({name:name}, callback);
    },
    function(user, callback){
        if (user){
           if (user.checkPassword(password)){
             callback(null, user);
           } else {
              next(new Error("incorrect name or password"));
           }
        } else {
            next(new Error("user not found"));
        }
    }
  ], function(err, user){
    if (err) return next(err);
    req.session.user = user._id;
    res.send({});
  });
  */

exports.logout = function(req, res){
  req.logout();
  res.redirect('/');
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
