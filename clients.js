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
    console.log('clients: ', Object.keys(_clients));
  }

  var findOne = function(condition){
    var keys = Object.keys(_clients);

    if (typeof condition !== 'undefined'){
      if (typeof condition.key !== 'undefined'){
        keys = [condition.key];
      }
    }

    if (keys.length === 0){
      return undefined;
    } else {
      return _clients[keys[0]];
    }

  }

  //возвращает массив с доступными пользовтелями
  var list = function(condition){
    var keys = Object.keys(_clients);

      if (typeof condition !== 'undefined'){
           if (typeof condition.exclude !== 'undefined'){
        keys.splice(keys.indexOf(condition.exclude), 1);
      }
      if (typeof condition.attribute !== 'undefined'){
        var key = Object.keys(condition.attribute)[0];
        var value = condition.attribute[key];
        keys = [];
        for (var k in _clients){
          if (_clients[k].hasOwnProperty(key) && _clients[k][key] === value){
            keys.push(k);
          }
        }
      }
    }

    return keys;
  }

  return {
    add: add,
    remove: remove,
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
