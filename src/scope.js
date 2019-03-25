/* jshint globalstrict: true */
'use strict';

function initWatchVal() {}

function Scope() {
  //prefix $$ signifies that this variable should be considered private to the AngularJS framework,
  //and shouldn't be called from application code
  this.$$watchers = [];
  this.$$lastDirtyWatch = null;
}

Scope.prototype.$watch = function(watchFn, listenerFn) {
  var watcher = {
    watchFn,
    listenerFn: listenerFn || function() {},
    last: initWatchVal,
  };
  this.$$watchers.push(watcher);
  this.$$lastDirtyWatch = null;
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
      self.$$lastDirtyWatch = watcher;
      watcher.last = newValue;
      watcher.listenerFn(
        newValue,
        oldValue === initWatchVal ? newValue : oldValue,
        self,
      );
      dirty = true;
    } else if (self.$$lastDirtyWatch === watcher) return false;
  });
  return dirty;
};

Scope.prototype.$digest = function() {
  var dirty,
    ttl = 10;
  this.$$lastDirtyWatch = null;
  do {
    dirty = this.$$digestOnce();
    if (dirty && !ttl--) {
      throw '10 digest iterations reached';
    }
  } while (dirty);
};
