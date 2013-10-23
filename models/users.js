var mongoose = require('mongoose'),
  crypto = require('crypto'),
  Schema = mongoose.Schema;

var UserSchema = new Schema({
  'name': {type: String, unique: true, required: true},
  'email': {type: String, unique: true, required: true},
  'hashedPassword': {type: String, required: true},
  'salt': {type: String, required: true},
  'created': {type: Date, default: Date.now}
});
var Users = mongoose.model('Users', usersSchema);

UserSchema.virtual('password')
    .set(function(password) {
        this._plainPassword = password;
        this.salt = Math.random() + '';
        this.hashedPassword = this.encryptPassword(password);
    })
    .get(function() { return this._plainPassword; });

UserSchema.methods = {
    encryptPassword: function (password) {
        return crypto.createHmac('sha1', this.salt).update(password).digest('hex');
    },
    checkPassword: function(password) {
        return this.hashedPassword == this.encryptPassword(password);
    }
}

mongoose.model('User', UserSchema);