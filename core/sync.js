var q = require('q'),
  database = require('./database'),
  flickr = require('./flickr'),
  syncing = false;

module.exports = function () {
  console.log('Start Flickr Sync');
  var deferred = q.defer(),
    collectionId,
    collectionData,
    client;

  if (syncing) {
    deferred.reject('Sync is in progress');
    return deferred;
  }

  syncing = true;

  // Fetch collection
  database
    .Config
    .get('collectionId')
    .then(function (data) {
      collectionId = data;
      if (!collectionId) {
        throw new Error('No collectionId saved');
      }
      return flickr
        .client();
    })
    .then(function (data) {
      client = data;
      return client.getCollectionData(collectionId);
    })
    .then(function (data) {
      collectionData = data;
      // Sync collection
      return database.Collection.saveFromFlickr(collectionData);
    })
    .then(function (collection) {
      return q.all(collectionData.set.map(function (set) {
        var deferred = q.defer(),
          photosetEntity;
        // fetch photosets
        client.getPhotoSetData(set.id)
          .then(function (photosetData) {
            // Sync photosets
            return database.PhotoSet.saveFromFlickr(photosetData, collection);
          })
          .then(function (photoset) {
            photosetEntity = photoset;
            // Fetch photos
            return client.getPhotosFromPhotoSet(photoset.orig_id);
          })
          .then(function (photosData) {
            var pos = 0;
            return q.all(photosData.map(function (photo) {
              // Sync photo
              photo.position = pos++;
              return database.Photo.saveFromFlick(photo, photosetEntity);
            }));
          })
          .then(function () {
            deferred.resolve();
          })
          .catch(function (err) {
            deferred.reject(err);
          });

        return deferred.promise;
      }));
    })
    .then(function () {
      console.log('Sync is done!');
      deferred.resolve();
    })
    .catch(function (err) {
      console.error('Sync failed.', err);
      deferred.reject(err);
    })
    .finally(function () {
      syncing = false;
    });

  return deferred.promise;
};
