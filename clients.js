'use strict'

function clients(){

  var _clients = {};

  var add = function(client){
    _clients[client.key] = client;
    console.log('add new client');
    console.log('clients: ', Object.keys(_clients));
  }

  var remove = function(key){
    delete _clients[key];
    console.log('remove client: '+key);
  }

  var findOne = function(exclude){
    var keys = Object.keys(_clients);
    if (exclude){
      keys.splice(keys.indexOf(exclude), 1);
    }
    if (keys.length === 0){
      return undefined;
    } else {
      return _clients[keys[0]];
    }
  }

  var list = function(){
    return Object.keys(_clients);
  }

  var length = function(){
    return Object.keys(_clients).length;
  }

  return {
    add: add,
    remove: remove,
    length: length,
    list: list,
    findOne: findOne
  }
}

//allow in node and browser
if( typeof exports !== 'undefined' ) {
  if( typeof module !== 'undefined' && module.exports ) {
    exports = module.exports = clients;
  }
  exports.clients = clients;
}
else {
  window.clients = clients;
}
