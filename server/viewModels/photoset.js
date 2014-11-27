var database = require('../../core/database'),
  q = require('q'),
  ViewModel = require('./view-model'),
  Photo = require('./photo');

function PhotoSet (data) {
  ViewModel.apply(this, arguments);
}

PhotoSet.prototype.getUrl = function () {
  var month = this.date_create.getMonth();
  return '/' + this.date_create.getFullYear() +
    '/' + (month > 9 ? month : '0' + month) +
    '/' + this.slug + '.html';
};

PhotoSet.prototype.getPhotos = function () {
  var deferred = q.defer();

  this
    .$data
    .getPhotos()
    .then(function (data) {
      deferred.resolve(data.map(function (photo) {
        return new Photo(photo);
      }));
    })
    .catch(function (err) {
      deferred.reject('No photo found');
    });

  return deferred.promise;
};

PhotoSet.getAllWithPrimaryPhoto = function (page) {
  var deferred = q.defer(),
    photosetsData = [];

  database
    .models
    .PhotoSet
    .findAll({
      limit: 10,
      offset: (page - 1) * 10,
      order: 'date_create DESC'
    })
    .then(function (photosets) {
      return q.all(photosets.map(function (photoset) {
        var deferred = q.defer(),
          photosetData = new PhotoSet(photoset);

        photoset.getPhotos({
          where: {
              is_primary: true
            }
          })
          .then(function (data) {
            if (data) {
              photosetData.primary = new Photo(data[0]);
            }
            photosetsData.push(photosetData);

            deferred.resolve(photosetsData);
          });

        return deferred.promise;
      }));
    })
    .then(function () {
      deferred.resolve(photosetsData);
    })
    .catch(function (err) {
      deferred.reject(err);
    });

  return deferred.promise;
};

PhotoSet.getFromSlug = function (slug) {
  var deferred = q.defer();

  database
    .models
    .PhotoSet
    .find({
      where: {
        slug: slug
      }
    })
    .then(function (data) {
      if (data) {
        deferred.resolve(new PhotoSet(data));
      } else {
        deferred.reject('Photoset not found');
      }
    })
    .catch(function (err) {
      deferred.reject(err);
    });

  return deferred.promise;
};

module.exports = PhotoSet;
