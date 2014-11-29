var q = require('q'),
  passport = require('passport'),
  FlickrStrategy = require('passport-flickr').Strategy,
  config = require('../config.json'),
  database = require('../core/database');

passport.use(new FlickrStrategy({
    consumerKey: config.API_KEY,
    consumerSecret: config.CONSUMER_SECRET,
    callbackURL: config.host + '/auth/callback'
  },
  function(token, tokenSecret, profile, done) {
    database.Config.get('userId')
      .then(function (value) {
        if (!value) {
          initConfig(token, tokenSecret, profile)
            .then(function () {
              done(null, profile);
              require('../core').init();
            });
          } else {
            if (profile.id === value) {
              done(null, profile);
            } else {
              done('Wrong user');
            }
          }
      })
      .catch (function (err) {
        console.error(err);
      });
  }
));

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

function init (app) {
  app.use(passport.initialize());
  app.use(passport.session());

  app.get('/auth',
    passport.authenticate('flickr'));

  app.get('/auth/callback', 
    passport.authenticate('flickr', { failureRedirect: '/settings' }),
    function(req, res) {
      // Successful authentication, redirect home.
      res.redirect('/settings');
    });
}

function initConfig (token, tokenSecret, profile) {
  return database.Config.set({
      token: token,
      tokenSecret: tokenSecret,
      userId: profile.id,
      userFullName: profile.fullName,
      userDisplayName: profile.displayName,
      // Default values (temp)
      coverTag: config.coverTag,
      collectionId: config.collectionId
    });
}

init.middleware = function (req, res, next) {
  if (req.user) {
    next();
  } else {
    res.write('<p> auth needed. <a href="/auth">Login with Flickr</a></p>');
  }
};

module.exports = init;
