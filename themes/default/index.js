var q = require('q');

module.exports = {
  home: function (data) {
    return q.all(data.photosets.map(function (photoset) {
      return photoset
        .getPhotosCount()
        .then(function (count) {
          photoset.count = count;
          return photoset;
        });
    }));
  },
  photoset: function (data) {
    // Make two smart columns of photos
    sortPhotos(data.photos);

    var deferred = q.defer();

    // Load next and previous links
    q.all([
      data.photoset.getNewerPhotoset(),
      data.photoset.getOlderPhotoset()])
      .then(function (_data) {
        data.newer = _data[0];
        data.older = _data[1];
        deferred.resolve(data);
      });

    return deferred.promise;
  }
};

function sortPhotos(photos) {
  var breakRow = 0;

  photos.forEach(function (photo, index) {
    if (breakRow === 0) {
      photo.startRow = true;
    }
    if (photo.landscape ||
        breakRow !== 1 && (!photos[index + 1] || photos[index + 1].landscape)) {
      photo.colWidth = 2;
      photo.endRow = true;
      breakRow = 0;
    } else {
      photo.colWidth = 1;
      breakRow++;
      if (breakRow > 1) {
        photo.endRow = true;
        breakRow = 0;
      }
    }
  });
}
