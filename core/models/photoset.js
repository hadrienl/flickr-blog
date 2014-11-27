var Sequelize = require('sequelize'),
  q = require('q');

function extractDateFromTitle(raw) {

  raw.date_update = new Date(raw.date_update*1000);

  var titleParts = raw.title.match(/^\[(.*?)\]\s?(.*)$/),
    date, title;
  if (!titleParts) {
    return;
  }

  try {
    date = new Date(titleParts[1]);
    title = titleParts[2];
  } catch (e) {
    raw.date_create = new Date(raw.date_create * 1000);
    return;
  }

  raw.title = title;
  raw.date_create = date;
}

module.exports = function (sequelize) {
  var PhotoSet = sequelize.define('PhotoSet', {
    orig_id: Sequelize.STRING,
    title: Sequelize.STRING,
    description: Sequelize.STRING,
    date_create: Sequelize.DATE,
    date_update: Sequelize.DATE
  });

  PhotoSet.synchronize = function (raw) {
    var deferred = q.defer();

    PhotoSet
      .find({ where: {orig_id: raw.id } })
      .complete(function (err, photoset) {
        if (err) {
          return deferred.reject(err);
        }
        if (!photoset) {
          photoset = PhotoSet.build();
        }

        extractDateFromTitle(raw);

        photoset.orig_id = raw.id;
        photoset.title = raw.title;
        photoset.description = raw.description;
        photoset.date_create = raw.date_create;
        photoset.date_update = raw.date_update;
        photoset.save()
        .complete(function (err, photoset) {
          if (err) {
            return deferred.reject(err);
          }
          deferred.resolve(photoset);
        });
      });

    return deferred.promise;
  };

  PhotoSet.getAllWithPrimaryPhoto = function () {
    var deferred = q.defer(),
      photosetsData;

    PhotoSet
      .findAll({
        limit: 10,
        offset: 0,
        order: 'date_create DESC'
      })
      .then(function (photosets) {
        photosetsData = photosets.map(function (photoset) {
          return photoset.dataValues;
        });

        return q.all(photosets.map(function (photoset) {
          return sequelize.models.Photo.getPhotoSetThumb(photoset.id);
        }));
      })
      .then(function (photos) {
        photos.forEach(function (photo) {
          photosetsData.some(function (photoset) {
            if (photo.photoset_id === photoset.id) {
              photoset.primary = photo;
              return true;
            }
          });
        });
        deferred.resolve(photosetsData);
      })
      .catch(function (err) {
        deferred.reject(err);
      });

    return deferred.promise;
  };

  return PhotoSet;
};
