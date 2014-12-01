var q = require('q'),
  Sequelize = require('sequelize'),
  sequelize = new Sequelize('flickr-blog.db', null, null, {
    dialect: 'sqlite',
    storage: './flickr-blog.db',
    maxConcurrentQueries: 500,
    logging: function () {}
  }),
  database = {
    init: init
  };

function init () {
  if (database.sequelize) {
    return q.fcall(function () {
      return database;
    });
  }
  database.Collection = require('./models/collection.js')(sequelize);
  database.PhotoSet = require('./models/photoset.js')(sequelize);
  database.Photo = require('./models/photo.js')(sequelize);
  database.Config = require('./models/config.js')(sequelize);

  database.Collection.hasMany(database.PhotoSet);
  database.PhotoSet.belongsTo(database.Collection);
  database.PhotoSet.hasMany(database.Photo);
  database.Photo.belongsTo(database.PhotoSet);
  database.sequelize = sequelize;
  database.models = sequelize.models;

  return sequelize
    .authenticate()
    .then(function(data) {
      return sequelize.sync();
    })
    .then(function () {
      return database;
    })
    .catch(function (error) {
      deferred.reject(error);
    });
}

module.exports = database;
