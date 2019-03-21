/* jshint globalstrict: true */
'use strict';

function Scope() {
  //prefix $$ signifies that this variable should be considered private to the AngularJS framework,
  //and shouldn't be called from application code
  this.$$watchers = [];
}

Scope.prototype.$watch = function(watchFn, listenerFn) {
  var watcher = { watchFn, listenerFn };
  this.$$watchers.push(watcher);
};

Scope.prototype.$watch = function() {
  _.forEach(this.$$watchers, function(watcher) {
    watcher.listenerFn();
  });
};
