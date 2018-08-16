var mongoose = require('mongoose');
var SshSchema = new mongoose.Schema({
  host: String,
  port: String,
  username: String,
  password: String,
  status: String,
  speed: Number
}, { timestamps: { createdAt: 'createdAt',updatedAt: 'updatedAt' } });
var Ssh = mongoose.model('Ssh', SshSchema);

module.exports = Ssh;
