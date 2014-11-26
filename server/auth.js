var passport = require('passport'),
  FlickrStrategy = require('passport-flickr').Strategy,
  config = require('../config.json');

passport.use(new FlickrStrategy({
    consumerKey: config.API_KEY,
    consumerSecret: config.CONSUMER_SECRET,
    callbackURL: config.host + '/auth/callback'
  },
  function(token, tokenSecret, profile, done) {
    if (profile.id === config.userId) {
      done(null, profile);
    } else {
      done('Wrong user');
    }
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

init.middleware = function (req, res, next) {
  console.log(req.user);
  if (req.user) {
    next();
  } else {
    res.write('<p> auth needed. <a href="/auth">Login with Flickr</a></p>');
  }
};

module.exports = init;
