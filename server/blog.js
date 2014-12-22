var database = require('../core/database'),
  PhotoSet = require('./viewModels/photoset.js'),
  q = require('q'),
  _ = require('lodash');

module.exports = function (app) {
  var photosets;
  app.get('/', function (req, res, next) {
    return home(req, res, next, app);
  });
  app.get('/page-:page.json', function (req, res, next) {
    return home(req, res, next, app, 'json');
  });
  app.get('/page-:page', function (req, res, next) {
    return home(req, res, next, app);
  });
  app.get(/^\/([0-9]{4})\/([0-9]{2})\/([^\/]+)\.html/, function (req, res, next) {
    return page(req, res, next, app);
  });
};

function home (req, res, next, app, format) {
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
      if (page * perPage < data.count) {
        data.nextPage = '/page-' + (+page+1) + ('json' === format ? '.json' : '');
      }
      if (page - 1 > 0) {
        if (page === 1 && format !== 'json') {
          data.previousPage = '/';
        } else {
          data.previousPage = '/page-' + (+page-1) + ('json' === format ? '.json' : '');
        }
      }
      return loadThemeData(app, 'home', data);
    })
    .then(function (_data) {
      data = _.merge(data, _data);
      if ('json' === format) {
        res.send(data);
      } else {
        res.render(__dirname + '/../themes/' + data.theme + '/views/home', data);
      }
    })
    .catch(function (err) {
      if (err !== 'redirect') {
        console.log(format);
        if ('json' === format) {
          res.send(err);
        } else {
          res.render(__dirname + '/../themes/' + data.theme + '/views/error', {
            error: err.message || err
          });
        }
      }
    });
}

function page (req, res, next, app) {
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
          data.photoset.date_create.getMonth() + 1 !== month) {
        res.redirect(data.photoset.getUrl());
        throw 'redirect';
      }
      return data.photoset.getCover();
    })
    .then(function (_data) {
      data.photoset.cover = _data;
      return data.photoset.getPhotos();
    })
    .then(function (_data) {
      data.photos = _data;

      data.photoset.tags = [];
      _.each(data.photos, function (photo) {
        _.each(photo.tags.split(/ /), function (tag) {
          if (!_.contains(data.photoset.tags, tag)) {
            data.photoset.tags.push(tag);
          }
        });
      });
      return loadThemeData(app, 'photoset', data);
    })
    .then(function (_data) {
      data = _.merge(data, _data);
      res.render(__dirname + '/../themes/' + data.theme + '/views/photoset', data);
    })
    .catch(function (err) {
      if (err !== 'redirect') {
        res.render(__dirname + '/../themes/' + data.theme + '/views/error', {
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

  database
    .Config
    .get('siteTitle')
    .then(function (siteTitle) {
      data.siteTitle = siteTitle;
      return database
        .Config
        .get('theme');
    })
    .then(function (theme) {
      data.theme = theme || 'default';
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

function loadThemeData (app, type, data) {
  try {
    var themeEngine = require('../themes/' + data.theme);
    if (!themeEngine[type]) {
      return q.resolve(data);
    }
    themeData = themeEngine[type](data);
    if (themeData.then) {
      return themeData;
    } else {
      return q.resolve(themeData);
    }
  } catch (e) {
    console.log(e);
    return q.resolve(data);
  }
}
