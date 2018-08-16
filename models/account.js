var mongoose = require('mongoose');
var AccountSchema = new mongoose.Schema({
  username: String,
  password: String,
  email: String,
  status: String
}, { timestamps: { createdAt: 'createdAt',updatedAt: 'updatedAt' } });
var Account = mongoose.model('Account', AccountSchema);

module.exports = Account;
