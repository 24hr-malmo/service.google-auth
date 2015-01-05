var config = require('../config');
var accountModel = require('./account-model');
var passport = require('passport');

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

var googleStragety = new GoogleStrategy({
    clientID: config.google.key,
    clientSecret: config.google.secret,
    callbackURL: config.google.callback
},
function(accessToken, refreshToken, profile, done) {

    var email = profile.emails[0].value;
    //console.log(profile);

    accountModel
        .findOrCreate({ 
            accessToken: accessToken,
            refreshToken: refreshToken,
            email: email,
            id: profile.id 
        })
        .then(function(user) {
            return done(null, user); 
        })
        .catch(function(err) {
            console.log(err);
            return done(err);
        });

})

passport.use(googleStragety);

exports.init = function(app) {

    app.get('/auth/google', 
            passport.authenticate('google', {
                scope: [
                    'email',
                    'https://www.googleapis.com/auth/calendar'
                ],
                accessType: 'offline', 
                approvalPrompt: 'force' 
            }));

    app.get('/auth/callback', passport.authenticate('google', { failureRedirect: '/login' }), function(req, res) {
        // Successful authentication, redirect home.
        res.redirect('/');
    });

};
