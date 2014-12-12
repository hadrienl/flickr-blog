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

  fetchData()
    .then(function (_data) {
      data = _.merge(data, _data);
      return PhotoSet
        .getAll({
          page: page,
          perPage: perPage
        });
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

  fetchData()
    .then(function (_data) {
      data = _.merge(data, _data);
      return PhotoSet
        .getFromSlug(slug);
    })
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

/**
 * Fetch common data for every pages
 */
function fetchData () {
  var deferred = q.defer(),
    data = {};
console.log('reload');
  database
    .Config
    .get('siteTitle')
    .then(function (siteTitle) {
      data.siteTitle = siteTitle;
      return database
        .Config
        .get('url');
    })
    .then(function (siteUrl) {
      data.siteUrl = siteUrl;
      return PhotoSet
        .getAll({
          orderBy: 'date_create',
          orderAsc: true
        });
    })
    .then(function (recentPosts) {
      data.recentPosts = recentPosts;
      deferred.resolve(data);
    })
    .catch(function (err) {
      deferred.reject(err);
    });

  return deferred.promise;
}
