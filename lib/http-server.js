var express = require('express');
var passport = require('passport');
var config = require('../config');

var app = express();
var server = require('http').createServer(app);
var accountModel = require('./account-model');
var bodyparser = require('body-parser');
var path = require('path');

app.use(bodyparser.urlencoded({ extended: true }));
app.use(bodyparser.json());

app.use(passport.initialize());
app.use(passport.session());

app.get('/', function(req, res) {
    accountModel
        .getList()
        .then(function(list) {
            var listOfEmails = list.map(function(user) {
                return user.email;
            });
            res.send('This is the oauth service. Click <a href="/auth/google">here</a> to oauth yourself<br/><br/><br/>Here are the current users:<br/><br/>' + listOfEmails.join('<br/>'));
        });
});

var security = require('./security');


// start both http and zmq socket server
exports.start = function(done) {

    if (typeof done != "function") {
        done = function() {};
    }

    // load all api endpoints
    //var routes = require('./routes');
    //for(var i = 0, ii = routes.length; i < ii; i++){ 
        //app.use('/', routes[i]);
    //};

    server.listen(config.server.port, function(err) {

        security.init(app);

        if (err) return done(err);
        done();

    });

}

// close the servers, both the http and the zmq socket server
exports.stop = function(done) {

    if (typeof done != "function") {
        done = function() {};
    }

    server.close(function(err) {
        if (err) return done(err);
        realtime.close();
        done();
    });

};
