var q = require('q'),
  config = require('../config.json'),
  database = require('./database');

function Client (flickr) {
  this.client = flickr;
}
Client.prototype.getCollectionData = function (id) {
  var deferred = q.defer(),
    params = {};

  if (id) {
    params.collection_id = id;
  }

  q.ninvoke(
      this.client,
      'executeAPIRequest',
      'flickr.collections.getTree',
      params,
      true
    )
    .then(function (data) {
      if (id && data.collections.collection[0].id === id) {
        deferred.resolve(data.collections.collection[0]);
      } else {
        deferred.resolve(data.collections.collection);
      }
    })
    .catch(function (err) {
      deferred.reject(err);
    });

  return deferred.promise;
};

Client.prototype.getPhotoSetData = function (id) {
  var deferred = q.defer();

  q.ninvoke(
      this.client,
      'executeAPIRequest',
      'flickr.photosets.getInfo', {
        'photoset_id': id
      },
      true
    )
    .then(function (data) {
      deferred.resolve(data.photoset);
    })
    .catch(function (err) {
      deferred.reject(err);
    });

  return deferred.promise;
};

Client.prototype.getPhotosFromPhotoSet = function (id) {
  var deferred = q.defer();

  q.ninvoke(
      this.client,
      'executeAPIRequest',
      'flickr.photosets.getPhotos', {
        'photoset_id': id,
        'extras': 'owner_name, tags, media, url_sq, url_t, url_s, url_m, url_o, last_update',
        'per_page': 9999
      },
      true
    )
    .then(function (data) {
      deferred.resolve(data.photoset.photo);
    })
    .catch(function (err) {
      deferred.reject(err);
    });

  return deferred.promise;
};

module.exports = {
  client: function () {
    var deferred = q.defer(),
      token, tokenSecret;

    database
      .init()
      .then(function (data) {
        return q.all([
          data.Config.get('token'),
          data.Config.get('tokenSecret')
        ]);
      })
      .then(function (data) {
        if (!data) {
          return deferred.reject('App is not well configured and cannot sync. Please go to /settings');
        }
        token = data[0];
        tokenSecret = data[1];

        var flickr = new (require('flickr').Flickr)(
          config.flickr.apiKey,
          config.flickr.consumerSecret,
          {
            'oauth_token': token,
            'oauth_token_secret': tokenSecret
          }
        );

        deferred.resolve(new Client(flickr));
      })
      .catch(function (err) {
        deferred.reject('Cannot instanciate Flickr client');
      });

    return deferred.promise;
  }
};
