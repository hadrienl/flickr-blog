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

  fetchPhotosets()
    .then(function (photosets) {
      return filterPhotosets(photosets);
    })
    .then(function (photosets) {
      return q.all(photosets.map(function (photoset) {
        return fetchPhotoset(photoset);
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

function fetchPhotosets () {
  return flickr
    .client()
    .then(function (_client) {
      client = _client;
      return client.getPhotosetsList();
    });
}

function filterPhotosets (photosets) {
  return database
    .Config
    .get('photosetFilter')
    .then(function (data) {
      var filter = data || /^\[blog\]/;
      return photosets.filter(function (photoset) {
        return photoset.title._content.match(filter);
      });
    });
}

function fetchPhotoset (photoset) {
  // fetch photosets
  return client
    .getPhotoSetData(photoset.id)
    .then(function (photosetData) {
      // Sync photosets
      return database.PhotoSet.saveFromFlickr(photosetData);
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
      log('photoset #' + photoset.id + ' fetched');
    })
    .catch(function (err) {
      log('error on fetching photoset #' + photoset.id + ' data' + err);
    })
    .then(function () {
      return 'OK ' + photoset.id;
    });
}

function log(data) {
  var now = new Date();
  console.log('[' +
    now.getFullYear() + '-' + now.getMonth() + '-' + now.getDate() + ' ' +
    now.getHours() + ':' + now.getMinutes() + '] ',
    data
  );
}
