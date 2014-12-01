var auth = require('./auth').middleware;

module.exports = function (app) {
  app.get('/settings', auth, function (req, res) {
    res.render('settings', {
      user: req.user
    });
  });
};
