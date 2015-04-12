var q = require('q'),
  database = require('./database'),
  flickr = require('./flickr'),
  syncing = false;

module.exports = function () {
  var deferred = q.defer(),
    collectionId,
    collectionData,
    client;
log('------- Is syncing ?', syncing);
  if (syncing) {
    deferred.reject('Sync is in progress');
    return deferred;
  }

  log('Start Flickr Sync');

  syncing = true;

  // Fetch collection
  log('retreive collection id');
  database
    .Config
    .get('collectionId')
    .then(function (data) {
      collectionId = data;
      if (!collectionId) {
        throw new Error('No collectionId saved');
      }
      log('get flickr client');
      return flickr
        .client();
    })
    .then(function (data) {
      client = data;
      log('fetch collection data');
      return client.getCollectionData(collectionId);
    })
    .then(function (data) {
      collectionData = data;
      // Sync collection
      log('save collection data');
      return database.Collection.saveFromFlickr(collectionData);
    })
    .then(function (collection) {
      log('fetch photosets data');
      return q.all(collectionData.set.map(function (set) {
        var deferred = q.defer(),
          photosetEntity;
        log('fetching ' + set.id);
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
            log('photoset #' + set.id + ' fetched');
            deferred.resolve();
          })
          .catch(function (err) {
            log('error on fetching photoset #' + set.id + ' data' + err);
            deferred.resolve();
          });

        return deferred.promise;
      }));
    })
    .then(function () {
      log('Sync is done!');
      deferred.resolve();
    })
    .catch(function (err) {
      log('Sync failed.' + err);
      deferred.reject(err);
    })
    .finally(function () {
      log('Sync is off');
      syncing = false;
    });

  return deferred.promise;
};
function log(data) {
  var now = new Date();
  console.log('[' +
    now.getFullYear() + '-' + now.getMonth() + '-' + now.getDate() + ' ' +
    now.getHours() + ':' + now.getMinutes() + '] ',
    data
  );
}
