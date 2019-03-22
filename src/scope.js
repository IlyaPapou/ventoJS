/* jshint globalstrict: true */
'use strict';

function Scope() {
  //prefix $$ signifies that this variable should be considered private to the AngularJS framework,
  //and shouldn't be called from application code
  this.$$watchers = [];
}

Scope.prototype.$watch = function(watchFn, listenerFn) {
  var watcher = { watchFn: watchFn, listenerFn: listenerFn };
  this.$$watchers.push(watcher);
};

Scope.prototype.$digest = function() {
  var self = this,
    newValue,
    oldValue;

  _.forEach(this.$$watchers, function(watcher) {
    newValue = watcher.watchFn(self);
    oldValue = watcher.last;

    if (newValue !== oldValue) {
      watcher.last = newValue;
      watcher.listenerFn(newValue, oldValue, self);
    }
  });
};
