var redisRequire = require("redis");
var redis = redisRequire.createClient();

var BaseRound = require('../../models/BaseRound.js');


function ContactRound() {
}
ContactRound.prototype = Object.create(BaseRound.prototype);
ContactRound.prototype.type = 'Contact';
ContactRound.prototype.word = '';
ContactRound.prototype.letters = [];
ContactRound.prototype.itsNot = [];
ContactRound.prototype.currentWord = '';
ContactRound.prototype.currentPlayer = '';
ContactRound.prototype.startRound = function () {
}
ContactRound.prototype.endRound = function () {
}
ContactRound.prototype.addPlayer = function () {
}
ContactRound.prototype.addSpectator = function () {
}
ContactRound.prototype.compareContact = function () {
}
ContactRound.prototype.setCurrent = function () {
}
ContactRound.prototype.setWord = function () {
}

redis.quit();


module.exports = ContactRound;
