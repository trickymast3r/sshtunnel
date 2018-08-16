var mongoose = require('mongoose');
var PortSchema = new mongoose.Schema({
  port: Number,
  status: String
}, { timestamps: { createdAt: 'createdAt',updatedAt: 'updatedAt' } });
var Port = mongoose.model('Port', PortSchema);

module.exports = Port;
