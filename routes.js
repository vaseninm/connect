//require controllers
var users = require('controllers/users'),
  passport = require('passport');

module.exports = function(app){

  app.get('/', function(req, res){
    if (!req.user){
      res.redirect('login');
    }
    res.send(req.user);
  });

  app.get('/login', function(req, res){
    res.send('authorization form');
  });

  app.post('/login', users.login);

  app.post('/logout', users.logout);

  app.post('/register', users.register);

}
