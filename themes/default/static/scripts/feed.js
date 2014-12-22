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

  /**
   * Init current photosets
   */
  [].forEach.call(document.querySelectorAll('article'), bindClick);

  /**
   * Load photosets
   */
  var container = document.querySelector('[data-component="home-photosets"]');
  var next = document.querySelector('[data-pagination-next]');
  if (next) {
    next.addEventListener('click', function (e) {
      e.preventDefault();
      loadPage(this);
    });
  }
  var previous = document.querySelector('[data-pagination-previous]');
  if (previous) {
    previous.addEventListener('click', function (e) {
      e.preventDefault();
      loadPage(this, true);
    });
  }

  window.addEventListener('scroll', function (e) {
    if (!next.parentNode) {
      return;
    }
    var top = $(next).offset().top - 200;
    if (window.scrollY + window.innerHeight > top) {
      loadPage(next);
    }
  });

  function loadPage (el, newer) {
    if (el.loading) {
      return;
    }

    var ajax = new XMLHttpRequest(),
      url = newer ?
        el.dataset.paginationPrevious : el.dataset.paginationNext;

    el.loading = true;

    ajax.open('GET', url, true);
    ajax.onload = function (e) {
      el.loading = false;
      if (200 !== e.target.status) {
        return;
      }

      var data;

      try {
        data = JSON.parse(e.target.responseText);
      } catch(err) {
        return;
      }
      if (newer && data.previousPage) {
        el.dataset.paginationPrevious = data.previousPage;
      } else if (!newer && data.nextPage) {
        el.dataset.paginationNext = data.nextPage;
      } else {
        el.remove();
      }

      var previous = container.firstChild;
      data.photosets.forEach(function (photoset) {
        photoset.date_create = new Date(photoset.date_create);
        photoset.date_update = new Date(photoset.date_update);
        photoset.cover.getSrc = function () {
          return photoset.cover.url_m;
        };
        photoset.getUrl = function () {
          return photoset.date_create.getFullYear() + '/' +
            pad(photoset.date_create.getMonth() + 1) + '/' +
            photoset.slug + '.html';
        };
        var component = new Component('photoset'),
          photosetEl = component.render({
            photoset: photoset
          });
        bindClick(photosetEl);
        if (newer) {
          container.insertBefore(photosetEl, previous);
          previous = photosetEl.nextSibling;
        } else {
          container.appendChild(photosetEl);
        }
      });
    };
    ajax.send(null);
  }

  /**
   *
   */
  // Open photoset on clicking anywhere on article block
  function bindClick (el) {
    el.addEventListener('click', function (e) {
      e.preventDefault();
      window.location = this.querySelector('a').getAttribute('href');
    });
  }

  function pad (nb) {
    if (nb < 10) {
      return '0'+nb;
    }
    return nb;
  }
})();
