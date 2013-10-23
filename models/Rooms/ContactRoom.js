var redisRequire = require("redis");
var redis = redisRequire.createClient();

var BaseRoom = require('../../models/BaseRoom.js');
var ContactRound = require('../../models/Rounds/ContactRound.js');

function ContactRoom() {
    BaseRoom.apply(this, arguments);
    redis.hset('rooms', this.id , this);
}
ContactRoom.prototype = Object.create(BaseRoom.prototype);
ContactRoom.prototype.type = 'Contact';
ContactRoom.prototype.minPlayers = 3;
ContactRoom.prototype.maxPlayers = 5;
ContactRoom.prototype.rounds = [];
ContactRoom.prototype.startRoom = function () {
    if (this.users.length >= this.minPlayers && this.status !== this.STATUS_CREATED) {
        this.status = this.STATUS_STARTED;
        this.addRound();
    }
}
ContactRoom.prototype.closeRoom = function () {
    redis.hdel('rooms', this.id);
}
ContactRoom.prototype.addUser = function (user) {
    if (user instanceof User && this.users.indexOf(user) !== -1) {
        this.users.push(user);
    }
}
ContactRoom.prototype.removeUser = function (user) {
    if (user instanceof User && this.users.indexOf(user) !== -1) {
        this.users.splice(this.users.indexOf(user), 1);
    }
}
ContactRoom.prototype.addRound = function () {
    var round = new ContactRound();
    this.rounds.push(round);
}
ContactRoom.prototype.getCurrentRound = function () {
    if (this.status !== this.STATUS_STARTED) {
        return false;
    }
    return this.rounds[this.rounds.length - 1];
}

redis.quit();

module.exports = ContactRoom;