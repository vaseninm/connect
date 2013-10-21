function BaseRoom () { }
BaseRoom.prototype.id = null;
BaseRoom.prototype.users = [];

function BaseRound () { }
BaseRound.prototype.id = null;
BaseRound.prototype.rid = null;
BaseRound.prototype.players = [];
BaseRound.prototype.spectators = [];





function ContactRoom () { }
ContactRoom.prototype = Object.create(BaseRoom.prototype);
ContactRoom.prototype.type = 'Contact';
ContactRoom.prototype.minPlayers = 3;
ContactRoom.prototype.maxPlayers = 5;
ContactRoom.prototype.rounds = [];
ContactRoom.prototype.startRoom = function() { }
ContactRoom.prototype.closeRoom = function() { }
ContactRoom.prototype.addUser = function() { }
ContactRoom.prototype.removeUser = function() { }
ContactRoom.prototype.addRound = function() { }
ContactRoom.prototype.getCurrentRound = function() { }

function ContactRound () { }
ContactRound.prototype = Object.create(BaseRound.prototype);
ContactRound.prototype.type = 'Contact';
ContactRound.prototype.word = '';
ContactRound.prototype.letters = [];
ContactRound.prototype.itsNot = [];
ContactRound.prototype.current = '';
ContactRound.prototype.startRound = function() { }
ContactRound.prototype.endRound = function() { }
ContactRound.prototype.addPlayer = function() { }
ContactRound.prototype.compareContact = function() { }
ContactRound.prototype.setCurrent = function() { }
ContactRound.prototype.setWord = function() { }

var Contact = new ContactGame();

console.log(Contact.type);
