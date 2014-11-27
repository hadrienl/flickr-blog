var Sequelize = require('sequelize'),
  q = require('q');

function getString (data) {
  return data._content !== undefined ?
    data._content : data;
}


function extractDateFromTitle(data) {

  data.date_update = new Date(data.date_update*1000);

  var titleParts = getString(data.title).match(/^\[(.*?)\]\s?(.*)$/),
    date, title;
  if (!titleParts) {
    return;
  }

  try {
    date = new Date(titleParts[1]);
    title = titleParts[2];
  } catch (e) {
    data.date_create = new Date(data.date_create * 1000);
    return;
  }

  data.title = title;
  data.date_create = date;
}

module.exports = function (sequelize) {
  var PhotoSet = sequelize.define('PhotoSet', {
    orig_id: Sequelize.STRING,
    title: Sequelize.STRING,
    slug: Sequelize.STRING,
    description: Sequelize.STRING,
    date_create: Sequelize.DATE,
    date_update: Sequelize.DATE
  });

  PhotoSet.saveFromFlickr = function (data, collection) {
    var deferred = q.defer(),
      photosetEntity;

    PhotoSet
      .find({ where: {orig_id: data.id } })
      .complete(function (err, photoset) {
        if (err) {
          return deferred.reject(err);
        }
        if (!photoset) {
          photoset = PhotoSet.build();
        }

        extractDateFromTitle(data);

        photoset.orig_id = data.id;
        photoset.title = getString(data.title);
        photoset.description = getString(data.description);
        photoset.date_create = data.date_create;
        photoset.date_update = data.date_update;
        photoset.save()
        .complete(function (err, photoset) {
          if (err) {
            return deferred.reject(err);
          }
          photosetEntity = photoset;
          return collection.addPhotoSet(photoset);
        })
        .complete(function (err, data) {
          if (err) {
            return deferred.reject(err);
          }
          deferred.resolve(photosetEntity);
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
        deferred.resolve(photosetsData);

        /*return q.all(photosets.map(function (photoset) {
          return sequelize.models.Photo.getPhotoSetThumb(photoset.id);
        }));*/
      })
      /*.then(function (photos) {
        photos.forEach(function (photo) {
          photosetsData.some(function (photoset) {
            if (photo.photoset_id === photoset.id) {
              photoset.primary = photo;
              return true;
            }
          });
        });
        deferred.resolve(photosetsData);
      })*/
      .catch(function (err) {
        deferred.reject(err);
      });

    return deferred.promise;
  };

  return PhotoSet;
};
