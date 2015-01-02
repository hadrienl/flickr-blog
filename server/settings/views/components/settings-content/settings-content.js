(function () {
'use strict';
var collection;

Polymer({
  ready: function () {
    this.collections = ['foo', 'bar'];
    var menu = this.shadowRoot.querySelector('paper-dropdown-menu');
    menu.addEventListener('core-select', function(e) {
      collection = menu.selectedItemLabel;
    });

    this.$.save.addEventListener('click', save);
  }
});

function save() {
  console.log('save', collection);
}
})();
