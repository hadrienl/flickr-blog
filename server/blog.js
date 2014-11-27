var database = require('../core/database');

module.exports = function (app) {
  app.get('/', function (req, res) {
    database
      .models
      .then(function (models) {
        return models.PhotoSet
          .findAll({
            limit: 10,
            offset: 0,
            order: 'date_create DESC'
          });
      })
      .then(function (photosets) {
        res.render('home', {
          photosets: photosets.map(function (photoset) {
            return photoset.dataValues;
          })
        });
      });
  });
};
