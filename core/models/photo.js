var Sequelize = require('sequelize'),
  q = require('q');

module.exports = function (sequelize) {
  var Photo = sequelize.define('Photo', {
    orig_id: Sequelize.STRING,
    title: Sequelize.STRING,
    tags: Sequelize.STRING,
    media: Sequelize.STRING,
    last_update: Sequelize.DATE,
    page_url: Sequelize.STRING,
    position: Sequelize.INTEGER,
    width: Sequelize.INTEGER,
    height: Sequelize.INTEGER,
    url_sq: Sequelize.STRING,
    url_t: Sequelize.STRING,
    url_s: Sequelize.STRING,
    url_m: Sequelize.STRING,
    url_o: Sequelize.STRING
  });

  Photo.saveFromFlick = function (data, set) {
    var deferred = q.defer(),
      photoEntity;

    Photo
      .find({ where: {orig_id: data.id } })
      .complete(function (err, photo) {
        if (err) {
          return deferred.reject(err);
        }
        try {
          if (!photo) {
            photo = Photo.build();
            throw 'Photo does not exist';
          }
          if (data.position !== photo.position) {
            throw 'Photo position changed';
          }
          if (new Date(data.lastupdate * 1000) > photo.last_update) {
            throw 'Photo has changed';
          }
          deferred.resolve(photo);
        } catch (e) {
          photo.photoset_id = data.id;
          photo.orig_id = data.id;
          photo.title = data.title;
          photo.tags = data.tags;
          photo.last_update = new Date(data.lastupdate * 1000);
          photo.page_url = 'https://www.flickr.com/photos/' + data.ownername +
            '/' + data.id + '/';
          photo.position = data.position;
          photo.width = +data.width_o;
          photo.height = +data.height_o;
          photo.url_sq = data.url_sq;
          photo.url_t = data.url_t;
          photo.url_s = data.url_s;
          photo.url_m = data.url_m;
          photo.url_o = data.url_o;
          photo.save()
          .complete(function (err, photo) {
            if (err) {
              return deferred.reject(err);
            }
            photoEntity = photo;
            return set.addPhoto(photoEntity);
          })
          .complete(function (err, photo) {
            if (err) {
              return deferred.reject(err);
            }
            deferred.resolve(photoEntity);
          });
        }
      });

    return deferred.promise;
  };

  return Photo;
};
