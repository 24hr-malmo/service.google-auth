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
        .getUser(email)
        .then(function(user) {
            if (user) {
                console.log("Found");
                var info = {refreshToken: user.refreshToken, callback: config.google.callback, accessToken: user.accessToken, id: config.google.key, secret: config.google.secret};
                socket.send(JSON.stringify(info));
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
    var info = {refreshToken: user.refreshToken, callback: config.google.callback, accessToken: user.accessToken, id: config.google.key, secret: config.google.secret};
    pSocket.send(user.email + ' ' + JSON.stringify(info));
};


