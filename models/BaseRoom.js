var redisRequire = require("redis");
var redis = redisRequire.createClient();

function BaseRoom() {
    redis.incr(this.INCREMENT_KEY);
    redis.get(this.INCREMENT_KEY, function (err, res) {
        if (err) throw new Error('Нет связи с кешем.');
        this.id = res;
    });
    this.status = this.STATUS_CREATED;
}
BaseRoom.prototype.INCREMENT_KEY = 'room_id_increment';

BaseRoom.prototype.STATUS_CREATED = 'created';
BaseRoom.prototype.STATUS_STARTED = 'started';
BaseRoom.prototype.STATUS_CLOSED = 'started';

BaseRoom.prototype.id = null;
BaseRoom.prototype.status = null;
BaseRoom.prototype.users = [];

redis.quit();

module.exports = BaseRoom;
