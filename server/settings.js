var auth = require('./auth').middleware,
  flickr = require('../core/flickr'),
  config = require('../config.json');

module.exports = function (app) {
  app.get('/settings', auth, function (req, res) {
    var collections;

    flickr
      .client()
      .then(function (client) {
        return client.getCollectionData();
      })
      .then(function (data) {
        collections = data.map(function (collection) {
          return {
            id: collection.id,
            title: collection.title,
            description: collection.description,
            photosets: collection.set.length,
            picture: collection.iconsmall
          };
        });
        res.render('admin/settings', {
          user: req.user,
          config: config,
          collections: collections
        });
      })
      .catch(function (err) {
        res.render('error', {
          error: err.message || err
        });
      });
  });
};
