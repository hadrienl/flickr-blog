module.exports = function (app) {
  app.get('/', function (req, res) {
    res.write('<p>Welcome to Flickr blog!</p>');
  });
};
