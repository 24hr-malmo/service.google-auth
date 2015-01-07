var db = require('./db');
var communication = require('./communication');
var Promise = require('es6-promise').Promise;
var request = require('request');
var config = require('../config');

var deadlineTimeouts = {};

// on init we must check all expiry dates

function init() {

    getList()
        .then(function(list) {
            list.forEach(function(user) {
                //console.log("SETUP REFRESH FOR %s", user.email);
                setupRefresh(user);
            });
        });

}

init();

function findOrCreate(user) {
 
   console.log('get user by email "%s"', user.email); 

   return addToList(user);

}

function addToList(user) {

    return getList()
        .then(function(list) {
           
            var existing = false; 
            list.forEach(function(item) {
                if (item.email === user.email) {
                    existing = item; 
                }
            });

            if (!existing) {
                console.log("ADD USER", user.email);
                list.push(user);
            } else {
                console.log("UPDATE USER", user.email);
                existing.accessToken = user.accessToken;
            }

            return saveList(list)
                .then(function() {
                    setupRefresh(user);
                    return user;
                });

        });

}

function setupRefresh(user) {

    var url = 'https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=' + user.accessToken;

    request.get(url, function(err, res, result) {

        if (err) {
            console.log("ERROR WHEN GETTING INFO ABOUT TOKEN", err);
            return;
        };

        var data = JSON.parse(result);

        // create a deadline 10 seconds before the actual deadline
        var deadline = data.expires_in * 1000 - 10 * 1000;

        console.log('User "%s" will expire in %s ms', user.email, deadline);

        // For some reason, if we have created a timeout before for this account, clear it now
        clearTimeout(deadlineTimeouts[data.email]);

        deadlineTimeouts[data.email] = setTimeout(function() {
            getNewToken(user); 
        }, deadline);

    });

}

function getNewToken(user) {

    var url = 'https://www.googleapis.com/oauth2/v3/token';
    var data = {
        client_id: config.google.key,
        client_secret: config.google.secret,
        refresh_token: user.refreshToken,
        grant_type: 'refresh_token'
    };

    console.log("get new token for %s", user.email);
    request.post(url, {form: data}, function(err, res, result) {

        if (err) {
            console.log("ERROR WHEN GETTING THE REFRESHED TOKEN", err);
            return;
        };

        var data = JSON.parse(result);

        user.accessToken = data.access_token;

        addToList(user)
            .then(function() {
                communication.publish(user);   
            })
            .catch(function(err) {
                console.log('catch', err);
            });

    });

}

function saveList(list) {

    return new Promise(function(resolve, reject) {

        db.put('list', {list: list}, {valueEncoding: 'json'}, function(err) {

            if (err) {
                return reject(err);
            }

            resolve();

        });

    });

}

function getUser(email) {

    return getList()
        .then(function(list) {

            var existing = false; 
            list.forEach(function(item) {
                if (item.email === email) {
                    existing = item; 
                }
            });

            if (existing) {
                return existing.accessToken;
            }
 
        });

}


function getList() {

    return new Promise(function(resolve, reject) {

        db.get('list', {valueEncoding: 'json'}, function(err, data) {

            if (err && err.name !== 'NotFoundError') {
                return reject(err);
            }

            var list = data && data.list ? data.list : [];

            resolve(list);

        });

    });

}

exports.findOrCreate = findOrCreate;
exports.getList = getList;
exports.getUser = getUser;


