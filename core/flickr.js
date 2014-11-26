var q = require('q'),
  config = require('../config.json');

module.exports = {
  client: function (database) {
    var deferred = q.defer(),
      token, tokenSecret;

    database.Config.get('token')
      .then(function (data) {
        if (!data) {
          return deferred.reject('No token');
        }
        token = data;
        return database.Config.get('tokenSecret');
      })
      .then(function (data) {
        tokenSecret = data;

        var flickr = new (require('flickr').Flickr)(
          config.API_KEY,
          config.CONSUMER_SECRET,
          {
            'oauth_token': token,
            'oauth_token_secret': tokenSecret
          }
        );

        deferred.resolve(flickr);
      })
      .catch(function (err) {
        deferred.reject('Cannot instanciate Flickr client');
      });

    return deferred.promise;
  }
};
