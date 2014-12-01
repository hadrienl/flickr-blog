var core = require('./core'),
  server = require('./server');

try {
  var config = require('./config.json');
} catch (e) {
  console.log('Please duplicate `config.json.dist` file, rename it to `config.json` and set your own parameters.');
  return;
}

core.init();
server.init();
