var database = require('../core/database'),
  PhotoSet = require('./viewModels/photoset.js'),
  q = require('q'),
  _ = require('lodash');

module.exports = function (app) {
  var photosets;
  app.get('/', home);
  app.get('/page-:page', home);
  app.get(/^\/([0-9]{4})\/([0-9]{2})\/([^\/]+)\.html/, page);
};

function home (req, res) {
  var page = req.params.page || 1,
    perPage = 12,
    photosets,
    data = {
      pageType: 'home',
      page: page,
      perPage: perPage
    };

  PhotoSet
    .getAll({
      page: page,
      perPage: perPage
    })
    .then(function (_data) {
      data.photosets = _data;
      return q.all(data.photosets.map(function (photoset) {
        return photoset
          .getCover()
          .then(function (cover) {
            photoset.cover = cover;
            return photoset;
          });
      }));
    })
    .then(function () {
      return PhotoSet.count();
    })
    .then(function (_data) {
      data.count = _data;
      res.render('home', data);
    });
}

function page (req, res, next) {
  var year = +req.params[0],
    month = +req.params[1],
    slug = req.params[2],
    photoset, photos,
    counter = 0,
    data = {
      pageType: 'photoset'
    };

  PhotoSet
    .getFromSlug(slug)
    .then(function (_data) {
      data.photoset = _data;
      if (data.photoset.date_create.getFullYear() !== year ||
          data.photoset.date_create.getMonth() !== month) {
        res.redirect(data.photoset.getUrl());
        throw 'redirect';
      }
      return data.photoset.getPhotos();
    })
    .then(function (_data) {
      data.photos = _data;
      res.render('photoset', data);
    })
    .catch(function (err) {
      console.error(err);
      if (err !== 'redirect') {
        res.render('error', {
          error: err.message || err
        });
      }
    });
}
