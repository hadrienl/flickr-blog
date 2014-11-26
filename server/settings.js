var auth = require('./auth').middleware;

module.exports = function (app) {
  app.get('/settings', auth, function (req, res) {
    res.write('<p>Welcome ' + req.user.fullName + '!</p>');
  });
};
