var Sequelize = require('sequelize'),
  q = require('q');

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

  return PhotoSet;
};
