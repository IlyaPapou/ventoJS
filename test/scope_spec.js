/* jshint globalstrict: true */
/* global Scope: false */
'use strict';

describe('Scope', function() {
  it('can be constructed and used as an object', function() {
    var scope = new Scope();
    scope.aProperty = 1;

    expect(scope.aProperty).toBe(1);
  });

  describe('digest', function() {
    var scope;
    beforeEach(function() {
      scope = new Scope();
    });

    it('calls the listener function of a watch on first $digest', function() {
      var watchFn = function() {
          return 'wat';
        },
        listenerFn = jasmine.createSpy();

      scope.$watch(watchFn, listenerFn);
      scope.$digest();

      expect(listenerFn).toHaveBeenCalled();
    });

    it('calls the watch function with the scope as the argument', function() {
      var watchFn = jasmine.createSpy(),
        listenerFn = function() {};

      scope.$watch(watchFn, listenerFn);
      scope.$digest();

      expect(watchFn).toHaveBeenCalledWith(scope);
    });

    it('calls the listener function when the watched value changes', function() {
      scope.someValue = 'a';
      scope.counter = 0;

      scope.$watch(
        function(scope) {
          return scope.someValue;
        },
        function(newValue, oldValue, scope) {
          scope.counter++;
        },
      );

      expect(scope.counter).toBe(0);
      scope.$digest();
      expect(scope.counter).toBe(1);
      scope.$digest();
      expect(scope.counter).toBe(1);
      scope.someValue = 'b';
      expect(scope.counter).toBe(1);
      scope.$digest();
      expect(scope.counter).toBe(2);
    });

    it('calls listener when watch value is first undefined', function() {
      scope.counter = 0;

      scope.$watch(
        function(scope) {
          return scope.someValue;
        },
        function(newValue, oldValue, scope) {
          scope.counter++;
        },
      );

      scope.$digest();
      expect(scope.counter).toBe(1);
    });

    it('calls listener with new value as old value the first time', function() {
      scope.someValue = 123;
      var oldGivenValue;

      scope.$watch(
        function(scope) {
          return scope.someValue;
        },
        function(newValue, oldValue, scope) {
          oldGivenValue = oldValue;
        },
      );

      scope.$digest();
      expect(oldGivenValue).toBe(123);
    });

    it('may have watchers that omit the listener function', function() {
      var watchFn = jasmine.createSpy().and.returnValue('something');

      scope.$watch(watchFn);
      scope.$digest();
      expect(watchFn).toHaveBeenCalled();
    });

    it('triggers chained watchers in the same digest', function() {
      scope.name = 'Ilya';

      scope.$watch(
        function(scope) {
          return scope.nameUpper;
        },
        function(newValue, oldValue, scope) {
          if (newValue) {
            scope.initial = newValue.substring(0, 1) + '.';
          }
        },
      );

      scope.$watch(
        function(scope) {
          return scope.name;
        },
        function(newValue, oldValue, scope) {
          if (newValue) {
            scope.nameUpper = newValue.toUpperCase();
          }
        },
      );

      scope.$digest();
      expect(scope.initial).toBe('I.');
      scope.name = 'Maks';
      scope.$digest();
      expect(scope.initial).toBe('M.');
    });

    it('gives up on the watches after 10 iteration', function() {
      scope.counterA = 0;
      scope.counterB = 0;

      scope.$watch(
        function(scope) {
          return scope.counterA;
        },
        function(newValue, oldValue, scope) {
          scope.counterB++;
        },
      );

      scope.$watch(
        function(scope) {
          return scope.counterB;
        },
        function(newValue, oldValue, scope) {
          scope.counterA++;
        },
      );

      expect(function() {
        scope.$digest();
      }).toThrow();
    });

    it('ends the digest when the last watch is clean', function() {
      scope.array = _.range(100);
      var watchExecutions = 0;

      _.times(100, function(i) {
        scope.$watch(
          function(scope) {
            watchExecutions++;
            return scope.array[i];
          },
          function(newValue, oldValue, scope) {},
        );
      });

      scope.$digest();
      expect(watchExecutions).toBe(200);

      scope.array[0] = 420;
      scope.$digest();
      expect(watchExecutions).toBe(301);
    });

    it('does not end digest so that new watches are not run', function() {
      scope.tmpValue = 'abc';
      scope.counter = 0;

      scope.$watch(
        function(scope) {
          return scope.tmpValue;
        },
        function(newValue, oldValue, scope) {
          scope.$watch(
            function(scope) {
              return scope.tmpValue;
            },
            function(newValue, oldValue, scope) {
              scope.counter++;
            },
          );
        },
      );

      scope.$digest();
      expect(scope.counter).toBe(1);
    });

    it('compares based on value if enabled', function() {
      scope.tmpValue = [1, 2, 3];
      scope.counter = 0;

      scope.$watch(
        function(scope) {
          return scope.tmpValue;
        },
        function(newValue, oldValue, scope) {
          scope.counter++;
        },
        true,
      );

      scope.$digest();
      expect(scope.counter).toBe(1);

      scope.tmpValue.push(4);
      scope.$digest();
      expect(scope.counter).toBe(2);
    });

    it('correctly handles NaNs', function() {
      scope.nan = NaN;
      scope.counter = 0;

      scope.$watch(
        function(scope) {
          return scope.nan;
        },
        function(newValue, oldValue, scope) {
          scope.counter++;
        },
      );

      scope.$digest();
      expect(scope.counter).toBe(1);

      scope.$digest();
      expect(scope.counter).toBe(1);
    });

    it("executes $eval'ed function and returns result", function() {
      scope.tmpValue = 42;

      var result = scope.$eval(function(scope) {
        return scope.tmpValue;
      });

      expect(result).toBe(42);
    });

    it('passes the second $eval argument straight through', function() {
      scope.tmpValue = 42;

      var result = scope.$eval(function(scope, arg) {
        return scope.tmpValue + arg;
      }, 2);

      expect(result).toBe(44);
    });

    it("executes $apply'ed function and starts the digest", function() {
      scope.tmpValue = 'someValue';
      scope.counter = 0;

      scope.$watch(
        function(scope) {
          return scope.tmpValue;
        },
        function(newValue, oldValue, scope) {
          scope.counter++;
        },
      );

      scope.$digest();
      expect(scope.counter).toBe(1);

      scope.$apply(function(scope) {
        scope.tmpValue = 'someOtherValue';
      });
      expect(scope.counter).toBe(2);
    });

    it("executes $evalAsync'ed function later in the same cycle", function() {
      scope.tmpValue = [1, 2, 3];
      scope.asyncEvaluated = false;
      scope.asyncEvaluatedImmediately = false;

      scope.$watch(
        function(scope) {
          return scope.tmpValue;
        },
        function(newValue, oldValue, scope) {
          scope.$evalAsync(function(scope) {
            scope.asyncEvaluated = true;
          });
          scope.asyncEvaluatedImmediately = scope.asyncEvaluated;
        },
      );

      scope.$digest();
      expect(scope.asyncEvaluated).toBe(true);
      expect(scope.asyncEvaluatedImmediately).toBe(false);
    });

    it("executes $evalAsync'ed functions added by watch functions", function() {
      scope.tmpValue = [1, 2, 3];
      scope.asyncEvaluated = false;

      scope.$watch(
        function(scope) {
          if (!scope.asyncEvaluated) {
            scope.$evalAsync(function(scope) {
              scope.asyncEvaluated = true;
            });
          }
          return scope.tmpValue;
        },
        function(newValue, oldValue, scope) {},
      );

      scope.$digest();
      expect(scope.asyncEvaluated).toBe(true);
    });

    it("executes $evalAsync'ed functions even when not dirty", function() {
      scope.tmpValue = [1, 2, 3];
      scope.asyncEvaluatedTimes = 0;

      scope.$watch(
        function(scope) {
          if (scope.asyncEvaluatedTimes < 2) {
            scope.$evalAsync(function(scope) {
              scope.asyncEvaluatedTimes++;
            });
          }
          return scope.tmpValue;
        },
        function(newValue, oldValue, scope) {},
      );

      scope.$digest();
      expect(scope.asyncEvaluatedTimes).toBe(2);
    });

    it('eventually halts $evalAsyncs added by watches', function() {
      scope.tmpValue = [1, 2, 3];

      scope.$watch(
        function(scope) {
          scope.$evalAsync(function(scope) {});
          return scope.tmpValue;
        },
        function(newValue, oldValue, scope) {},
      );

      expect(function() {
        scope.$digest();
      }).toThrow();
    });

    it('has a $$phase field whose value is the current digest phase', function() {
      scope.tmpValue = [1, 2, 3];

      scope.phaseInWatchFunction = undefined;
      scope.phaseInListenerFunction = undefined;
      scope.phaseInApplyFunction = undefined;

      scope.$watch(
        function(scope) {
          scope.phaseInWatchFunction = scope.$$phase;
          return scope.tmpValue;
        },
        function(newValue, oldValue, scope) {
          scope.phaseInListenerFunction = scope.$$phase;
        },
      );

      scope.$apply(function(scope) {
        scope.phaseInApplyFunction = scope.$$phase;
      });

      expect(scope.phaseInWatchFunction).toBe('$digest');
      expect(scope.phaseInListenerFunction).toBe('$digest');
      expect(scope.phaseInApplyFunction).toBe('$apply');
    });

    it('schedules a digest in $evalAsync', function(done) {
      scope.tmpValue = 'abc';
      scope.counter = 0;

      scope.$watch(
        function(scope) {
          return scope.tmpValue;
        },
        function(newValue, oldValue, scope) {
          scope.counter++;
        },
      );

      scope.$evalAsync(function(scope) {});

      expect(scope.counter).toBe(0);
      setTimeout(function() {
        expect(scope.counter).toBe(1);
        done();
      }, 50);
    });

    it('allows async $apply with $applyAsync', function(done) {
      scope.counter = 0;

      scope.$watch(
        function(scope) {
          return scope.tmpValue;
        },
        function(newValue, oldValue, scope) {
          scope.counter++;
        },
      );

      scope.$digest();
      scope.$applyAsync(function(scope) {
        scope.tmpValue = 'abc';
      });
      expect(scope.counter).toBe(1);

      setTimeout(function() {
        expect(scope.counter).toBe(2);
        done();
      }, 50);
    });

    it("never executes $applyAsync'ed function in the same cycle", function(done) {
      scope.tmpValue = [1, 2, 3];
      scope.asyncApplied = false;

      scope.$watch(
        function(scope) {
          return scope.tmpValue;
        },
        function(newValue, oldValue, scope) {
          scope.$applyAsync(function(scope) {
            scope.asyncApplied = true;
          });
        },
      );

      scope.$digest();
      expect(scope.asyncApplied).toBe(false);
      setTimeout(function() {
        expect(scope.asyncApplied).toBe(true);
        done();
      }, 50);
    });

    it('coalesces many calls to $applyAsync', function(done) {
      scope.counter = 0;

      scope.$watch(
        function(scope) {
          scope.counter++;
          return scope.tmpValue;
        },
        function(newValue, oldValue, scope) {},
      );

      scope.$applyAsync(function(scope) {
        scope.tmpValue = 'abc';
      });

      scope.$applyAsync(function(scope) {
        scope.tmpValue = 'def';
      });

      setTimeout(function() {
        expect(scope.counter).toBe(2);
        done();
      }, 50);
    });

    it('cancels and flushes $applyAsync if digested first', function(done) {
      scope.counter = 0;

      scope.$watch(
        function(scope) {
          scope.counter++;
          return scope.tmpValue;
        },
        function(newValue, oldValue, scope) {},
      );

      scope.$applyAsync(function(scope) {
        scope.tmpValue = 'abc';
      });

      scope.$applyAsync(function(scope) {
        scope.tmpValue = 'def';
      });

      scope.$digest();
      expect(scope.counter).toBe(2);
      expect(scope.tmpValue).toEqual('def');

      setTimeout(function() {
        expect(scope.counter).toBe(2);
        done();
      }, 50);
    });
    //
  });
});
