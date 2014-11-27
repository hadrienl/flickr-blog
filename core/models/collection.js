var Sequelize = require('sequelize'),
  q = require('q');

module.exports = function (sequelize) {
  var Collection = sequelize.define('Collection', {
    orig_id: Sequelize.STRING,
    title: Sequelize.STRING,
    description: Sequelize.STRING,
    iconlarge: Sequelize.STRING
  });

  Collection.saveFromFlickr = function (data) {
    var deferred = q.defer();

    Collection
      .find({ where: {orig_id: data.id } })
      .complete(function (err, collection) {
        if (err) {
          return deferred.reject(err);
        }
        try {
          if (!collection) {
            throw 'Collection does not exist';
          }
          deferred.resolve(collection);
        } catch (e) {
          collection = Collection.build();
          collection.orig_id = data.id;
          collection.title = data.title;
          collection.description = data.description;
          collection.iconlarge = data.iconlarg;
          collection.save()
          .complete(function (err, collection) {
            if (err) {
              return deferred.reject(err);
            }
            deferred.resolve(collection);
          });
        }
      });

    return deferred.promise;
  };

  return Collection;
};
