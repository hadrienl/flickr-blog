var Sequelize = require('sequelize'),
  q = require('q');

module.exports = function (sequelize) {
  var Config = sequelize.define('Config', {
    label: Sequelize.STRING,
    value: Sequelize.STRING
  });

  Config.set = function (data) {
    return q.all(Object.keys(data).map(function (k) {
      var deferred = q.defer();

      var config = Config.build({
        label: k,
        value: data[k]
      });
      config
        .save()
        .complete(function (err, res) {
          if (err) {
            deferred.reject(err);
          } else {
            deferred.resolve(res);
          }
        });

      return deferred.promise;
    }));
  };

  Config.get = function (label) {
    var deferred = q.defer();

    Config
      .find({ where:  {label: label} })
        .complete(function (err, config) {
          if (err) {
            deferred.reject(err);
          } else {
            deferred.resolve(config && config.value);
          }
        });

    return deferred.promise;
  };

  return Config;
};
