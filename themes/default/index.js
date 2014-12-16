module.exports = {
  home: function (data) {
    return data;
  },
  photoset: function (data) {
    // Make two smart columns of photos
    sortPhotos(data.photos);
    return data;
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
