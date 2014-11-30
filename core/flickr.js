var q = require('q'),
  config = require('../config.json');

function Client (flickr) {
  this.client = flickr;
}
Client.prototype.getCollectionData = function (id) {
  var deferred = q.defer();

  q.ninvoke(
      this.client,
      'executeAPIRequest',
      'flickr.collections.getTree', {
        'collection_id': id
      },
      true
    )
    .then(function (data) {
      deferred.resolve(data.collections.collection[0]);
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
        'extras': 'tags, media, url_sq, url_t, url_s, url_m, url_o, last_update',
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
  client: function (database) {
    var deferred = q.defer(),
      token, tokenSecret;

    database.Config.get('token')
      .then(function (data) {
        if (!data) {
          return deferred.reject('App is not well configured and cannot sync. Please go to /settings');
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

        deferred.resolve(new Client(flickr));
      })
      .catch(function (err) {
        deferred.reject('Cannot instanciate Flickr client');
      });

    return deferred.promise;
  }
};
