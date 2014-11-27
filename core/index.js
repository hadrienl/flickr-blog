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
          console.error('Start Flickr Sync');
          sync(client)
            .then (function () {
              console.error('Sync is done!');
            });
        }
        syncLoop = setInterval(startSync, 5*60*1000);
        startSync();
      });
  },
  client: client
};
module.exports = core;
