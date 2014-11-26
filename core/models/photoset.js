var Sequelize = require('sequelize'),
  q = require('q');

module.exports = function (sequelize) {
  var PhotoSet = sequelize.define('PhotoSet', {
    orig_id: Sequelize.STRING,
    title: Sequelize.STRING,
    description: Sequelize.STRING
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
          photoset = PhotoSet.build({
            orig_id: raw.id,
            title: raw.title,
            description: raw.description
          });
        }
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
