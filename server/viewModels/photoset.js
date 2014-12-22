var database = require('../../core/database'),
  q = require('q'),
  ViewModel = require('./view-model'),
  Photo = require('./photo');

function PhotoSet (data) {
  ViewModel.apply(this, arguments);
}

PhotoSet.prototype.getUrl = function () {
  var month = this.date_create.getMonth() + 1;
  return '/' + this.date_create.getFullYear() +
    '/' + (month > 9 ? month : '0' + month) +
    '/' + this.slug + '.html';
};

PhotoSet.prototype.getPhotos = function () {
  var deferred = q.defer();

  this
    .$data
    .getPhotos({
      order: 'position ASC'
    })
    .then(function (data) {
      deferred.resolve(data.map(function (photo) {
        return new Photo(photo);
      }));
    })
    .catch(function (err) {
      deferred.reject(new Error('No photo found'));
    });

  return deferred.promise;
};

PhotoSet.prototype.getPhotosCount = function () {
  var deferred = q.defer();

  database
    .Photo
    .findAndCountAll({
      where: { PhotoSetId: this.$data.id },
      limit: 1
    })
    .then(function (data) {
      deferred.resolve(data.count);
    });

  return deferred.promise;
};

PhotoSet.prototype.getNewerPhotoset = function () {
  return getNavigation(this.date_create);
};

PhotoSet.prototype.getOlderPhotoset = function () {
  return getNavigation(this.date_create, true);
};

function getNavigation (date, older) {
  var deferred = q.defer();

  database
    .PhotoSet
    .find({
      where: ['date_create ' + (older ? '<' : '>') + ' ?', date],
      limit: 1
    })
    .then(function (photoset) {
      if (photoset) {
        deferred.resolve(new PhotoSet(photoset));
      } else {
        deferred.resolve(null);
      }
    })
    .catch(function (err) {
      deferred.reject(err);
    });

  return deferred.promise;
}

PhotoSet.prototype.getCover = function () {
  var coverTag,
    $data = this.$data;

  return database
    .models
    .Config
    .get('coverTag')
    .then(function (data) {
      coverTag = data || 'cover';

      return $data.getPhotos();
    })
    .then(function (data) {
      if (!data) {
        return null;
      }
      var cover = data[0];

      if (coverTag) {
        data.some(function (photo) {
          if (!!~photo.tags.indexOf(coverTag)) {
            cover = photo;
            return true;
          }
        });
      }

      return new Photo(cover);
    });
};

PhotoSet.count = function () {
  var deferred = q.defer();

  database
    .models
    .PhotoSet
    .count()
    .then(function (count) {
      deferred.resolve(count);
    })
    .catch(function (err) {
      deferred.reject(err);
    });

  return deferred.promise;
};

PhotoSet.getAll = function (config) {
  config = config || {};
  config.perPage = config.perPage || 10;
  config.page = config.page || 1;

  return database
    .models
    .PhotoSet
    .findAll({
      limit: config.perPage,
      offset: (config.page - 1) * config.perPage,
      order: 'date_create DESC'
    })
    .then(function (photosets) {
      return photosets.map(function (photoset) {
        return new PhotoSet(photoset);
      }).sort(function (a, b) {
        if (a.date_create < b.date_create) {
          return 1;
        } else if (a.date_create > b.date_create) {
          return -1;
        } else {
          return 0;
        }
      });
    });
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
