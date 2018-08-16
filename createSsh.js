const Client = require('ssh2').Client;

var createNewSsh = function(info, accept, deny) {
  Ssh.findOne()
    .where('status')
    .in(['live'])
    .then(ssh => {
      var conn = new Client();
      return conn
        .on('ready', function() {
          conn.forwardOut(info.srcAddr, info.srcPort, info.dstAddr, info.dstPort, function(err, stream) {
            if (err) {
              console.log('FORWARD ERROR', err);
              conn.end();
              return deny();
            }
            var clientSocket;
            if ((clientSocket = accept(true))) {
              stream
                .pipe(clientSocket)
                .pipe(stream)
                .on('close', function() {
                  console.log('Close');
                  conn.end();
                });
            } else {
              console.log('Not Accept');
              conn.end();
            }
          });
        })
        .on('error', function(err) {
          console.log('CONNECTION ERROR', err);
          deny();
        })
        .connect(ssh);
    });
};

module.exports = createNewSsh;
