var database = require('./database'),
  sync = require('./sync'),
  client;

var core = {
  database: null,
  init: function () {
    return database.init()
      .then(function (database) {
        core.database = database;
        return require('./flickr').client(database);
      })
      .then(function (data) {
        client = data;
        console.log('Start Flickr sync');
        return sync(client);
      })
      .then(function () {
        console.log('Sync is done!');
      })
      .catch (function (err) {
        console.error(err);
      });
  },
  client: client
};
module.exports = core;
