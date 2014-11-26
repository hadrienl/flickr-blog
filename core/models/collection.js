var Sequelize = require('sequelize'),
  q = require('q');

module.exports = function (sequelize) {
  var Collection = sequelize.define('Collection', {
    orig_id: Sequelize.STRING,
    title: Sequelize.STRING,
    description: Sequelize.STRING,
    iconlarge: Sequelize.STRING
  });

  Collection.synchronize = function (raw) {
    var deferred = q.defer();

    Collection
      .find({ where: {orig_id: raw.id } })
      .complete(function (err, collection) {
        if (err) {
          return deferred.reject(err);
        }
        if (!collection) {
          collection = Collection.build({
            orig_id: raw.id,
            title: raw.title,
            description: raw.description,
            iconlarge: raw.iconlarge
          });
        }
        collection.save()
        .complete(function (err, collection) {
          if (err) {
            return deferred.reject(err);
          }
          deferred.resolve(collection);
        });
      });

    return deferred.promise;
  };

  return Collection;
};
