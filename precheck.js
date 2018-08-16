var mongoose = require('mongoose');
var Promise = require('bluebird');
var Client = require('ssh2').Client;
var chalk = require('chalk');
var cluster = require( "cluster" );
var os = require( "os" );
var Ssh = require('./models/ssh');

var Multiprogress = require("multi-progress");
var multiBar = new Multiprogress();
mongoose.Promise = Promise;


mongoose.connect('mongodb://localhost:27017/autosocks',{useMongoClient: true});

var checkSsh = function(config,cb) {
  var conn = new Client();
  conn.on('ready', function() {
    cb.call();
    console.log(config.host,' success')
  }).on('error', function(err) {
    console.log(config.host,err)
  }).connect(config);
}
var preCheck = function() {
  Ssh.findOneAndUpdate({},{ $set: { status: 'checking' }}).where('status').in(['recheck','new']).then((ssh) => {
    if(ssh != null) {
      var conn = new Client();
      conn.on('ready', function() {
        var starttime = Date.now();
        conn.forwardOut('127.0.0.1', 8972, 'shop.nordstrom.com', 80, function(err, stream) {
          if (err) {
              ssh.update({status:'die'}).then(() => {
                conn.end();
                process.send({action:'status',status:'die'})
                preCheck();
              });
          } else {
            stream.on('close', function() {
              var totalTime = Date.now() - starttime;
              ssh.update({status:'live',speed: totalTime}).then(() => {
                conn.end();
                process.send({action:'status',status:'live'})
                preCheck();
              });
            }).on('data', function(data) {

            }).end([
              'HEAD / HTTP/1.1',
              'Host: shop.nordstrom.com',
              'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.94 Safari/537.36',
              'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
              'Connection: keep-alive',
              '',
              ''
            ].join('\r\n'));
          }
        });
      }).on('error', function(err) {
        ssh.update({status:'die'}).then(() => {
          conn.end();
          process.send({action:'status',status:'die'})
          preCheck();
        });
      }).connect(ssh);
    } else {
      setTimeout(preCheck,2000);
    }
  });
}

if ( cluster.isMaster ) {
  var threads = os.cpus().length;
  var progressBars = [];
  var progressCounter = [];
  console.log( chalk.red( "[Master]" ), "Master process started.", process.pid );
  for ( var i = 0; i < threads; i++ ) {
      var worker = cluster.fork();
      worker.on('message', function(msg) {
        if(msg.action =='status') {
          if(msg.status == 'start') {
            progressBars[this.id] = multiBar.newBar(chalk.green("[ Worker "+this.id+"]")+': :live/:die :total', {total:100000,live:msg.live,die:msg.die,clear:true });
            progressCounter[this.id] = {live:0,die:0};
          }
          if(msg.status == 'live') {
            progressCounter[this.id].live++;
          }
          if(msg.status == 'die') {
            progressCounter[this.id].die++;
          }
          progressBars[this.id].tick({
            live: progressCounter[this.id].live,
            die:  progressCounter[this.id].die
          });
        }
      });
  }
} else {
  process.send({action:'status',status:'start',live: 0,die:0 })
  preCheck();
}
