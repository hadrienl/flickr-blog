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
        //console.error(photosets);
        res.render('home', {
          photosets: photosets
        });
      });
  });
};
