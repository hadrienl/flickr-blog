var database = require('../core/database'),
  PhotoSet = require('./viewModels/photoset.js');

module.exports = function (swig) {
  var data = {};

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
      swig.setDefaults({
        locals: data
      });
    });
};
