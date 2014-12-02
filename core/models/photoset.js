var Sequelize = require('sequelize'),
  q = require('q'),
  entities = new (require('html-entities').XmlEntities)();

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

        extractDateFromTitle(data);
        data.description = entities.decode(getString(data.description));
        data.title = getString(data.title);

        try {
          if (!photoset) {
            photoset = PhotoSet.build();
            throw 'photoset does not exist';
          }
          if (data.date_update > photoset.date_update) {
            throw 'photoset had changed';
          }
          deferred.resolve(photoset);
        } catch(e) {
          photoset.orig_id = data.id;
          photoset.title = data.title;
          photoset.slug = slugify(data.title);
          photoset.description = data.description;
          photoset.date_create = data.date_create;
          photoset.date_update = data.date_update;
          photoset.save()
          .then(function (photoset) {
            photosetEntity = photoset;
            return collection.addPhotoSet(photoset);
          })
          .then(function (data) {
            deferred.resolve(photosetEntity);
          })
          .catch(function (err) {
            return deferred.reject(err);
          });
        }
      });

    return deferred.promise;
  };

  return PhotoSet;
};


function getString (data) {
  return data._content !== undefined ?
    data._content : data;
}


function extractDateFromTitle(data) {
  data.date_update = new Date(data.date_update * 1000);
  data.date_create = new Date(data.date_create * 1000);

  var titleParts = getString(data.title).match(/^\[(.*?)\]\s?(.*)$/),
    date, title;
  if (!titleParts) {
    return;
  }

  try {
    date = new Date(titleParts[1]);
    title = titleParts[2];
  } catch (e) {
    return;
  }

  data.title = title;
  data.date_create = date;
}

function slugify (string) {
  return string
    .toLowerCase()
    .replace(/[^\w]+/g, '-')
    .replace(/^-|-$/g, '');
}
