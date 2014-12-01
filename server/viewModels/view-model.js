function ViewModel (data) {
  var self = this;

  Object.defineProperty(self, '$data', {
    enumerable: false,
    value: data
  });

  function addAttr (k) {
    Object.defineProperty(self, k, {
      enumerable: true,
      get: function () {
        return self.$data[k];
      }
    });
  }
  if (data.dataValues) {
    for (var i in data.dataValues) {
      addAttr(i);
    }
  }
}
module.exports = ViewModel;
