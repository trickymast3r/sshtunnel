var socks = require('socksv5');
var Client = require('ssh2').Client;

var ssh_config = {
  username: 'squid',
  password: '123456',
  host: '138.197.46.90',
  port: 22
};
var createNewConn = function() {
  var conn = new Client();
  return conn.on('ready', function() {
    conn.forwardOut(info.srcAddr,
                    info.srcPort,
                    info.dstAddr,
                    info.dstPort,
                    function(err, stream) {
                      if (err) {
                        conn.end();
                        return deny();
                      }

                      var clientSocket;
                      if (clientSocket = accept(true)) {
                        stream.pipe(clientSocket).pipe(stream).on('close', function() {
                          conn.end();
                        });
                      } else
                        conn.end();
    });
  }).on('error', function(err) {
    deny();
  })
}
var a = createNewConn();
socks.createServer(function(info, accept, deny) {
  a.connect(ssh_config); 
}).listen(30001, 'localhost', function() {
  console.log('SOCKSv5 proxy server started on port 30001');
}).useAuth(socks.auth.None());
