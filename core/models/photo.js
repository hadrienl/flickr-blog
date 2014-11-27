var Sequelize = require('sequelize'),
  q = require('q');

module.exports = function (sequelize) {
  var Photo = sequelize.define('Photo', {
    photoset_id: Sequelize.INTEGER,
    orig_id: Sequelize.STRING,
    title: Sequelize.STRING,
    tags: Sequelize.STRING,
    media: Sequelize.STRING,
    url_sq: Sequelize.STRING,
    url_t: Sequelize.STRING,
    url_s: Sequelize.STRING,
    url_m: Sequelize.STRING,
    url_o: Sequelize.STRING,
    is_primary: Sequelize.BOOLEAN
  });

  Photo.synchronize = function (raw, set) {
    var deferred = q.defer();

    Photo
      .find({ where: {orig_id: raw.id } })
      .complete(function (err, photo) {
        if (err) {
          return deferred.reject(err);
        }
        if (!photo) {
          photo = Photo.build();
        }
        photo.photoset_id = set.id;
        photo.orig_id = raw.id;
        photo.title = raw.title;
        photo.tags = raw.tags;
        photo.url_sq = raw.url_sq;
        photo.url_t = raw.url_t;
        photo.url_s = raw.url_s;
        photo.url_m = raw.url_m;
        photo.url_o = raw.url_;
        photo.is_primary = !!raw.isprimary;
        photo.save()
        .complete(function (err, photo) {
          if (err) {
            return deferred.reject(err);
          }
          deferred.resolve(photo);
        });
      });

    return deferred.promise;
  };

  Photo.getPhotoSetThumb = function (photosetId) {
    var deferred = q.defer();

    Photo.find({
        where: Sequelize.and(
          { photoset_id: photosetId },
          { is_primary: true }
        )
      })
      .then(function (photo) {
        if (!photo) {
          deferred.resolve(null);
        } else {
          deferred.resolve(photo.dataValues);
        }
      });

    return deferred.promise;
  };

  return Photo;
};
