require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"O0HrNI":[function(require,module,exports){
'use strict'

function clients(){

  var _clients = {};

  var add = function(client){
    _clients[client.key] = client;
    console.log('add new client');
    console.log('clients: ', Object.keys(_clients));
    if (this.publish){
      this.publish('client add', client); 
    } 
  }

  var remove = function(key){
    delete _clients[key];
    console.log('remove client: '+key);
    console.log('clients: ', Object.keys(_clients));
    if (this.publish){
      this.publish('client remove', key); 
    } 
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
    findOne: findOne,
  }
}

module.exports = clients;

},{}],"clients":[function(require,module,exports){
module.exports=require('O0HrNI');
},{}],"B/E7vX":[function(require,module,exports){
var mediator = (function() {
    var subscribe = function(channel, fn) {
        if (!mediator.channels[channel]) mediator.channels[channel] = [];
        mediator.channels[channel].push({ context: this, callback: fn });
        return this;
    },
 
    publish = function(channel) {
        if (!mediator.channels[channel]) return false;
        var args = Array.prototype.slice.call(arguments, 1);
        for (var i = 0, l = mediator.channels[channel].length; i < l; i++) {
            var subscription = mediator.channels[channel][i];
            subscription.callback.apply(subscription.context, args);
        }
        console.log('[event]', channel);
        return this;
    };
 
    return {
        channels: {},
        publish: publish,
        subscribe: subscribe,
        installTo: function(obj) {
            obj.subscribe = subscribe;
            obj.publish = publish;
        }
    };
}());

module.exports = mediator;

},{}],"mediator":[function(require,module,exports){
module.exports=require('B/E7vX');
},{}]},{},[])