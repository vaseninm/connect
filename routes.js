//require controllers
var users = require('controllers/users');

module.exports = function(app){
  app.get('/', function(req, res){
    res.send(req.user);
  });

  app.post('/login', users.login);

  app.post('/logout', users.logout);

  app.post('/register', users.register);

}
