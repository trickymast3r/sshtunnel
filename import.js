var fs = require('fs');
var csvparse = require('csv-parse');
var mongoose = require('mongoose');
var Promise = require('bluebird');
var Ssh = require('./models/ssh');
var Port = require('./models/port');
mongoose.Promise = Promise;

mongoose.connect('mongodb://localhost:27017/autosocks',{useMongoClient: true});
// function range(start, end) {
//   return Array(end - start + 1).fill().map((_, idx) => start + idx)
// }
// var ports = range(30000,39999);
// ports.forEach(function(i) {
//   Port.findOne().where('port').in([i]).then((bindPort) => {
//     if(bindPort == null) {
//       new Port({
//         port: i,
//         status: 'free',
//         updatedAt: Date.now()
//       }).save();
//     }
//   });
// })
var input = fs.createReadStream('./list.txt');
input.pipe(csvparse({delimiter: '|'}))
  .on('data',function(row) {
    var newSsh = new Ssh({
      host: row[0],
      port: 22,
      username: row[1],
      password: row[2],
      status: 'new',
      speed: 0,
      updatedAt: Date.now(),
      createdAt: Date.now()
    });
    newSsh.save().then(function(r) {
      console.log(r.host+' saved');
    })
  })
