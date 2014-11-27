var q = require('q'),
  database = require('./database');

function processCollection (client, collection) {
  var deferred = q.defer();

  // Get collection in database
  database.Collection
    .synchronize(collection)
    .then(function () {
      return q.all(collection.set.map(function (set) {
        return processSet(client, set);
      }));
    })
    .then(function (data) {
      // Read photos for each photoset
      return q.all(data.map(function (set) {
        return processPhotos(client, set);
      }));
    })
    .then(function (photos) {
      deferred.resolve('done');
    })
    .catch(function (err) {
      console.error(err);
    });

  return deferred.promise;
}

function processSet(client, set) {
  var deferred = q.defer();

  q.ninvoke(
      client,
      'executeAPIRequest',
      'flickr.photosets.getInfo',
      {
        'photoset_id': set.id
      },
      true
    )
    .then(function (data) {
      return database.PhotoSet.synchronize({
        id: data.photoset.id,
        title: data.photoset.title._content,
        description: data.photoset.description._content,
        date_create: data.photoset.date_create,
        date_update: data.photoset.date_update
      });
    })
    .then(function (data) {
      deferred.resolve(data);
    })
    .catch(function (err) {
      deferred.reject(err);
    });

  return deferred.promise;
}

function processPhotos (client, set) {
  var deferred = q.defer();

  q.ninvoke(
    client,
    'executeAPIRequest',
    'flickr.photosets.getPhotos',
    {
      'photoset_id': set.orig_id,
      'extras': 'tags, media, url_sq, url_t, url_s, url_m, url_o',
      'per_page': 9999
    },
    true
  )
  // Write each photo in database
  .then(function (data) {
    return q.all(data.photoset.photo.map(function (photo) {
      return database.Photo.synchronize(photo, set);
    }));
  })
  .then(function () {
    deferred.resolve();
  })
  .catch(function (err) {
    deferred.reject(err);
  });

  return deferred.promise;
}

module.exports = function (client) {
  var deferred = q.defer(),
    collections = [];

  // Get collections
  q.ninvoke(
      client,
      'executeAPIRequest',
      'flickr.collections.getTree',
      {},
      true
    )
    .then(function (res) {
      return q.all(res.collections.collection.map(function (collection) {
        return processCollection(client, collection);
      }));
    })
    .then(function () {
      deferred.resolve();
    })
    .catch (function (error) {
      console.error(error);
    });

  return deferred.promise;
};
