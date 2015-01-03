var httpServer = require('./http-server');
var communication = require('./communication');

// start both http and zmq socket server
exports.start = function(done) {

    if (typeof done != "function") {
        done = function() {};
    }

    httpServer.start(function(err) {
        if (err) return done(err);


        done();
    });

};

// close the servers, both the http and the zmq socket server
exports.stop = function(done) {

    if (typeof done != "function") {
        done = function() {};
    }

    httpServer.stop(function(err) {
        done(err);
    });

};
