var Sequelize = require('sequelize'),
  q = require('q');

module.exports = function (sequelize) {
  var Config = sequelize.define('Config', {
    label: Sequelize.STRING,
    value: Sequelize.STRING
  });

  Config.set = function (data) {
    return q.all(Object.keys(data).map(function (k) {
      return Config
        .find({ where: { label: k } })
        .then(function (config) {
          if (!config) {
            config = Config.build({
              label: k
            });
          }
          config.value = data[k];
          return config.save();
        });
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
