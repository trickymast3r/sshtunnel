var mongoose = require('mongoose');
var Promise = require('bluebird');
var createSock = require('./createSock')
var Ssh = require('./models/ssh');
var Port = require('./models/port');
var express    = require('express');
var bodyParser = require('body-parser');

mongoose.Promise = Promise;

mongoose.connect('mongodb://localhost:27017/autosocks',{useMongoClient: true});

var app        = express();
var socksConns = [];
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.get('/', (req, res) => res.send('Hello World!'))
app.get('/test', (req,res) => {
  Port.findOne().where('status').in(['free']).sort({'updatedAt':1}).then((bindPort) => {
    console.log(bindPort);
    res.send('ehlo');
  })
})
app.get('/sshs', (req,res) => {
  Ssh.find().sort({'speed':1}).where('status').in(['live']).then(async (sshs) => {
    res.send(JSON.stringify(sshs));
  })
})
app.get('/sshrecheck',(req,res) => {
  Ssh.findOne({}).where('status').in(['recheck','new']).then((ssh) => {
    res.send(JSON.stringify(ssh));
  })
})
app.get('/new', (req, res) => {
  createSock(function(socksConn,bindedPort,ssh) {
    socksConns.push({bindedPort: bindedPort,conn: socksConn});
    res.send({'sshIp': ssh.host,'bindedPort': bindedPort.port });
  });
})
app.get('/recheck/:ip', function(req,res) {
  Ssh.findOneAndUpdate({host:  req.params.ip},{ $set: { status: 'recheck'}}).then((ssh) => {
    res.send({'sshIp': ssh.host})
  })
});
app.get('/kill/:port', function(req,res) {
  var killPort = req.params.port;
  var unbindedPort = 0;
  Promise.all(socksConns.map(async function(i) {
    if(i.bindedPort.port == killPort) {
      // console.log('Match',i.bindedPort.port,':',killPort);
      await i.conn.close(async function() {
        // console.log('Call Close Success');
      });
      await i.bindedPort.update({status:'free',updatedAt: Date.now()}).then(async function() {
        unbindedPort = i.bindedPort.port;
        // console.log('Call Update Success '+unbindedPort,'|',i.bindedPort.port);
      });
    } else {
      // console.log('Not Match',i.bindedPort.port,':',killPort);
    }
  })).then(() => {
    // console.log('End  Response');
    res.send({unbindedPort: unbindedPort});
  });
})
app.listen(3000, () => console.log('Sock Controller listening on port 3000!'))
