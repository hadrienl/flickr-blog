var q = require('q'),
  Sequelize = require('sequelize'),
  sequelize = new Sequelize('flickr-blog.db', null, null, {
    dialect: 'sqlite',
    storage: './flickr-blog.db',
    logging: function () {}
  }),
  database = {
    init: init
  };

function init () {
  var deferred = q.defer();

  sequelize
    .authenticate()
    .complete(function(err) {
      if (!!err) {
        console.log('Unable to connect to the database:', err);
        deferred.reject(err);
      } else {
        migrate(sequelize)
          .then(function () {
            deferred.resolve(database);
          })
          .catch(function (error) {
            deferred.reject(error);
          });
      }
    });

  return deferred.promise;
}

function migrate (sequelize) {
  var deferred = q.defer();

  database.Collection = require('./models/collection.js')(sequelize);
  database.PhotoSet = require('./models/photoset.js')(sequelize);
  database.Photo = require('./models/photo.js')(sequelize);
  database.Config = require('./models/config.js')(sequelize);

  sequelize
    .sync()
    .complete(function (err, data) {
      if (err) {
        console.error('Migration failed:', err);
        return deferred.reject(err);
      }
      deferred.resolve();
    });

  return deferred.promise;
}


module.exports = database;
