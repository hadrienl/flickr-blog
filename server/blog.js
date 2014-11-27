var database = require('../core/database'),
  PhotoSet = require('./viewModels/photoset.js');

module.exports = function (app) {
  app.get('/', function (req, res) {
    PhotoSet
      .getAllWithPrimaryPhoto()
      .then(function (photosets) {
        res.render('home', {
          photosets: photosets
        });
      });
  });
  app.get(/^\/([0-9]{4})\/([0-9]{2})\/([^\/]+)\.html/, function (req, res, next) {
    var year = +req.params[0],
      month = +req.params[1],
      slug = req.params[2],
      photoset, photos;

    PhotoSet
      .getFromSlug(slug)
      .then(function (data) {
        photoset = data;
        if (photoset.date_create.getFullYear() !== year ||
            photoset.date_create.getMonth() !== month) {
          res.redirect(photoset.getUrl());
          throw 'redirect';
        }
        return data.getPhotos();
      })
      .then(function (data) {
        photos = data;
        res.render('photoset', {
          photoset: photoset,
          photos: photos
        });
      })
      .catch(function (err) {
        if (err !== 'redirect') {
          res.render('error', {
            error: err.message
          });
        }
      });
  });
};
