var express = require('express'),
  session = require('express-session'),
  app = express();

app.use(session({
  secret: 'erkjfh earkfghleirzgh erzklhg rejlh gkjerzh gkjerh rgkherzegh t gt',
  resave: false,
  saveUninitialized: true
}));

require('./auth')(app);
require('./blog')(app);
require('./settings')(app);

function init () {
  var server = app.listen(3000, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Flick-blog app listening at http://%s:%s', host, port);
  });
}

module.exports = {
  init: init
};
