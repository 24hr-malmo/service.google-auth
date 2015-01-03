var zmq = require('zmq');
var zonar = require('zonar');
var accountModel = require('./account-model');
var config = require('../config');

// configs
var port = config.communication.port;
var pubPort = config.communication.pubPort;
var address = "tcp://0.0.0.0:" + port;
var pAddress = "tcp://0.0.0.0:" + pubPort;

// setup
var broadcaster = zonar.create({ payload: { 'rep': port, 'pub': pubPort },  net: '24hr', name: 'google-tokens' });

var socket = zmq.socket('rep');
var pSocket = zmq.socket('pub');

socket.bindSync(address);
socket.on('message', function(message) {

    var email = message.toString();
    accountModel
        .getToken(email)
        .then(function(token) {
            if (!token) {
                console.log("Found");
                socket.send(token);
            } else {
                console.log("Not found");
                socket.send('404');
           }
        });

});

pSocket.bindSync(pAddress);

console.log("Google Tokens request server service started");

broadcaster.start(function() {
    console.log("Broadcasting google-tokens.pub");
});

// Greacefully quit
process.on('SIGINT', function() {
    console.log("");
    broadcaster.stop(function() {
        console.log("Zonar has stoped");
        socket.close(function() { });
        process.exit(0);
    });
});

exports.publish = function(user) {
    console.log('send new token for "%s"', user.email);
    pSocket.send(user.email + ' ' + user.accessToken);
};


