//require controllers
var users = require('controllers/users'),
  passport = require('passport');

module.exports = function(app){

  app.get('/', function(req, res){
    res.send('hello');
  });


  app.get('/login', function(req, res){
    res.send(':(');
  });

  app.post('/login', users.login);

  app.post('/logout', users.logout);

  app.post('/register', users.register);

}
