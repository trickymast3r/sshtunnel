var socks = require('socksv5'),
  Client = require('ssh2').Client;
var Ssh = require('./models/ssh');
var Port = require('./models/port');

var createSock = function(cb) {
  //  Ssh.findOne().where('status').in(['live']).then((ssh) => {
  Ssh.findOneAndUpdate({}, { $set: { updatedAt: Date.now() } })
    .sort({ updatedAt: 1 })
    .where('status')
    .in(['live'])
    .then(ssh => {
      if (ssh) {
        Port.findOneAndUpdate({}, { $set: { status: 'busy', updatedAt: Date.now() } })
          .sort({ updatedAt: 1 })
          .where('status')
          .in(['free'])
          .then(bindPort => {
            if (bindPort) {
              var sock = socks.createServer(function(info, accept, deny) {
                try {
                  var conn = new Client();
                  conn
                    .on('ready', function() {
                      conn.forwardOut(info.srcAddr, info.srcPort, info.dstAddr, info.dstPort, function(err, stream) {
                        if (err) {
                          conn.end();
                          return deny();
                        }
                        var clientSocket;
                        if ((clientSocket = accept(true))) {
                          stream
                            .pipe(clientSocket)
                            .pipe(stream)
                            .on('close', function() {
                              conn.end();
                            });
                        } else {
                          conn.end();
                        }
                      });
                    })
                    .on('error', function(err) {
                      deny();
                    })
                    .connect(ssh);
                } catch (e) {
                  console.log('CREATE SERVER ERROR', e);
                }
              });
              try {
                sock
                  .listen(bindPort.port, '0.0.0.0', function() {
                    cb(sock, bindPort, ssh);
                    bindPort.update({ status: 'run', updatedAt: Date.now() }).then(() => {
                      console.log('SOCKSv5 proxy server started on ' + bindPort.port);
                    });
                  })
                  .useAuth(socks.auth.None());
              } catch (e) {
                console.log('SOCKS LISTEN ERROR', e);
              }
            }
          });
      }
    });
};

module.exports = createSock;
