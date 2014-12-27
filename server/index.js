var express = require('express'),
  session = require('express-session'),
  bodyParser = require('body-parser'),
  app = express(),
  swig = require('./swig'),
  config = require('../config.json');

app.engine('html', swig.renderFile);
app.set('view engine', 'html');
app.set('views', __dirname + '/views');
app.set('view cache', false);
swig.setDefaults({ cache: false });

app.use(session({
  secret: 'erkjfh earkfghleirzgh erzklhg rejlh gkjerzh gkjerh rgkherzegh t gt',
  resave: false,
  saveUninitialized: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

require('./auth')(app);
require('./settings')(app);
require('./blog')(app);

function init () {
  var server = app.listen(config.server.port, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Flick-blog app listening at http://%s:%s', host, port);
  });
}

module.exports = {
  init: init
};
