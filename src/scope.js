/* jshint globalstrict: true */
'use strict';

function initWatchVal() {}

function Scope() {
  //prefix $$ signifies that this variable should be considered private to the AngularJS framework,
  //and shouldn't be called from application code
  this.$$watchers = [];
}

Scope.prototype.$watch = function(watchFn, listenerFn) {
  var watcher = {
    watchFn,
    listenerFn: listenerFn || function() {},
    last: initWatchVal,
  };
  this.$$watchers.push(watcher);
};

Scope.prototype.$$digestOnce = function() {
  var self = this,
    newValue,
    oldValue,
    dirty = false;

  _.forEach(this.$$watchers, function(watcher) {
    newValue = watcher.watchFn(self);
    oldValue = watcher.last;

    if (newValue !== oldValue) {
      watcher.last = newValue;
      watcher.listenerFn(
        newValue,
        oldValue === initWatchVal ? newValue : oldValue,
        self,
      );
      dirty = true;
    }
  });
  return dirty;
};

Scope.prototype.$digest = function() {
  var dirty,
    ttl = 10;
  do {
    dirty = this.$$digestOnce();
    if (dirty && !ttl--) {
      throw '10 digest iterations reached';
    }
  } while (dirty);
};
