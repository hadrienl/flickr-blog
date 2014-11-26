var Sequelize = require('sequelize'),
  q = require('q');

module.exports = function (sequelize) {
  var Photo = sequelize.define('Photo', {
    orig_id: Sequelize.STRING,
    title: Sequelize.STRING,
    tags: Sequelize.STRING,
    media: Sequelize.STRING,
    url_sq: Sequelize.STRING,
    url_t: Sequelize.STRING,
    url_s: Sequelize.STRING,
    url_m: Sequelize.STRING,
    url_o: Sequelize.STRING
  });

  Photo.synchronize = function (raw) {
    var deferred = q.defer();

    Photo
      .find({ where: {orig_id: raw.id } })
      .complete(function (err, photo) {
        if (err) {
          return deferred.reject(err);
        }
        if (!photo) {
          photo = Photo.build({
            orig_id: raw.id,
            title: raw.title,
            tags: raw.tags,
            url_sq: raw.url_sq,
            url_t: raw.url_t,
            url_s: raw.url_s,
            url_m: raw.url_m,
            url_o: raw.url_o
          });
        }
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

  return Photo;
};
