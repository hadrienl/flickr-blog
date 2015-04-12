var database = require('./database'),
  sync = require('./sync'),
  client,
  syncLoop;

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
        if (syncLoop) {
          cancelInterval(syncLoop);
        }
        function startSync() {
          sync(client);
        }
        syncLoop = setInterval(startSync, 60*1000);
        startSync();
      });
  },
  client: client
};
module.exports = core;
