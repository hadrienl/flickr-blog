var database = require('../core/database');

module.exports = function (app) {
  app.get('/', function (req, res) {
    database
      .models
      .PhotoSet
      .getAllWithPrimaryPhoto()
      .then(function (photosets) {
        res.render('home', {
          photosets: photosets
        });
      });
  });
};
