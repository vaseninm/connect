var redisRequire = require("redis");
var redis = redisRequire.createClient();

function BaseRound() {
}
BaseRound.prototype.id = null;
BaseRound.prototype.rid = null;
BaseRound.prototype.players = [];
BaseRound.prototype.spectators = [];

redis.quit();

module.exports = BaseRound;