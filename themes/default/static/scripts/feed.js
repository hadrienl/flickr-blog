// Open photoset on clicking anywhere on article block
(function (els) {
  [].forEach.call(els, function (el) {
    el.addEventListener('click', function (e) {
      e.preventDefault();
      window.location = this.querySelector('a').getAttribute('href');
    });
  });
})(document.querySelectorAll('article'));


(function () {
  'use strict';

  function Component (name) {
    var el = document.querySelector('[data-component="' + name + '"]');
    if (el) {
      this.$template = el.cloneNode(true);
    }
  }

  Component.filters = {
    date: function (str, format) {
      var date = new Date(str);
      return new DateFormatter().formatDate(date, format);
    }
  };

  Component.prototype.getValue = function (data, key) {
    var keys = key.split(/\./),
      value = data || {};

    keys.some(function (k) {
      var isFunction = k.match(/^(.*)\((.*)\)$/);
      if (isFunction) {
        value = value[isFunction[1]].call(null, isFunction[1]);
      } else {
        value = value[k];
      }
      if (!value) {
        return true;
      }
    });

    return value;
  };

  Component.prototype.applyFilters = function (str, filters) {
    filters.forEach(function (token) {
      var filter = token.match(/^(.*)\((.*)\)$/),
          params = [];
      if (filter) {
        params = filter[2].split(/\s?,\s?/).map(function (param) {
          return param.replace(/^["'](.*)["']$/, '$1');
        });
        filter = filter[1];
      } else {
        filter = token;
      }

      params.unshift(str);

      if (Component.filters[filter]) {
        str = Component.filters[filter].apply(window, params);
      }

    });
    return str;
  };

  Component.prototype.interpolate = function (data, str) {
    var self = this;

    return str
      .replace(/\\/g, '')
      .replace(/{{\s?(.*?)\s?}}/g, function (str, match) {
        console.log(match);
        var hasFilters = match.split(/\|/);
        if (hasFilters.length > 1) {
          return self.applyFilters(self.getValue(data, hasFilters.shift()), hasFilters);
        }
        return self.getValue(data, match);
      });
  };

  Component.prototype.replaceValues = function (data) {
    var values = this.$template.querySelectorAll('[data-component-value]'),
      self = this;

    [].forEach.call(values, function (el) {
      el.innerHTML = self.interpolate(data, el.dataset.componentValue);
    });
  };

  Component.prototype.replaceAttributes = function (data) {
    var attributes = {},
      self = this;

    [].forEach.call(this.$template.querySelectorAll('*'), function (el) {
      for (var k in el.dataset) {
        var attr = k.match(/^componentAttribute(.*)$/);
        if (attr) {
          attr = attr[1].toLowerCase();
          if (!attributes[attr]) {
            attributes[attr] = [];
          }

          el.setAttribute(
            attr,
            self.interpolate(data, el.dataset[k])
          );
        }
      }
    });
  };

  Component.prototype.render = function (data) {
    this.replaceValues(data);
    this.replaceAttributes(data);

    return this.$template;
  };

  //
  var container = document.querySelector('[data-component="home-photosets"]');
  var photoset = new Component('photoset'),
    el = photoset.render({
      photoset: {
        title: 'Fake photoset',
        count: 118,
        date_create: new Date(1985, 9, 15),
        cover: {
          getSrc: function (size) {
            return 'http://i.imgur.com/WAc2uoO.gif';
          }
        },
        getUrl: function () {
          return 'http://google.com';
        }
      }
    });
  container.appendChild(el);
})();
