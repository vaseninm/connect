//require controllers
var users = require('controllers/users');

module.exports = function(app){
  app.get('/', users.login);
 /* app.use(function(req, res, next){*/
//    if (req.is('*/json')){
 /*     
    } else {
      next();
    }
  });*/
}
