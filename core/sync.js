var q = require('q'),
  database = require('./database');

module.exports = function (client) {
  var deferred = q.defer(),
    collectionData;

  // I'm supposed to already have a Collection set
  var collectionId = '24022430-72157646968831464';

  // Fetch collection
  client.getCollectionData(collectionId)
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
            return q.all(photosData.map(function (photo) {
              // Sync photo
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
      deferred.resolve();
    })
    .catch(function (err) {
      deferred.reject(err);
    });

  return deferred.promise;
};
