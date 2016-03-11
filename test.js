'use strict';

require('mocha');
var App = require('./fixtures/app');
var assert = require('assert');
var extend = require('./');

describe('extend', function() {
  var Parent;
  var Ctor;
  var proto;

  beforeEach(function() {
    Parent = function() {}
    Parent.foo = 'bar';
    Parent.prototype.a = function() {};
    Parent.prototype.b = function() {};
    Parent.prototype.c = function() {};
    Object.defineProperty(Parent.prototype, 'count', {
      get: function() {
        return Object.keys(this).length;
      },
      set: function() {}
    });
    Ctor = function() {
      Parent.call(this);
    };
    proto = App.prototype;
  });

  it('should add `Parent.prototype` to `Ctor` instances as `_parent_`', function() {
    var ext = extend(Parent);
    var instance1 = new Ctor();
    assert.equal(typeof instance1._parent_, 'undefined');
    ext(Ctor);
    var instance2 = new Ctor();
    assert.equal(typeof instance2._parent_, 'object');
    assert.deepEqual(instance2._parent_, Parent.prototype);
  });

  it('should access `Parent` methods through `_parent_`', function() {
    Parent.prototype.upper = function(str) {
      return str.toUpperCase();
    };

    var ext = extend(Parent);
    ext(Ctor);

    var instance = new Ctor();
    assert.equal(instance.upper('foo'), 'FOO');

    instance.upper = function(str) {
      return str;
    };
    assert.equal(instance.upper('foo'), 'foo');

    instance.upper = function(str) {
      return this._parent_.upper(str) + ' ' + str;
    };
    assert.equal(instance.upper('foo'), 'FOO foo');
  });

  it('should add static methods to Ctor:', function() {
    var ext = extend(Parent);
    ext(Ctor);
    assert(typeof Ctor.extend === 'function');
    assert(Ctor.foo === 'bar');
  });

  it('should add an extend method to Parent to add static methods to Ctor:', function() {
    Parent.extend = extend(Parent);
    Parent.extend(Ctor);
    assert(typeof Ctor.extend === 'function');
    assert(Ctor.foo === 'bar');
  });

  it('should add prototype methods to Ctor:', function() {
    var ext = extend(Parent);
    ext(Ctor);
    assert(typeof Ctor.prototype.a === 'function');
    assert(typeof Ctor.prototype.b === 'function');
    assert(typeof Ctor.prototype.c === 'function');
  });

  it('should add descriptors to Ctor:', function() {
    var ext = extend(Parent);
    ext(Ctor);
  });

  it('should copy prototype properties to Ctor:', function() {
    var ext = extend(Parent);
    ext(Ctor, App.prototype);
    assert(typeof Ctor.prototype.get === 'function');
    assert(typeof Ctor.prototype.set === 'function');
    assert(typeof Ctor.prototype.del === 'function');
  });

  it('should add a mixin method to the prototype of Ctor using `extend` function:', function() {
    var ext = extend(Parent, function(Child) {
      Child.prototype.mixin = function(key, val) {
        Child.prototype[key] = val;
      };
    });
    ext(Ctor, App.prototype);
    assert(typeof Ctor.prototype.mixin === 'function');
    assert(typeof Ctor.prototype.get === 'function');
    assert(typeof Ctor.prototype.set === 'function');
    assert(typeof Ctor.prototype.del === 'function');
  });

  it('should mixin methods to the Ctor.prototype using `extend` function:', function() {
    var ext = extend(Parent, function(Child) {
      Child.prototype.mixin = function(key, val) {
        Child.prototype[key] = val;
      };
    });
    ext(Ctor, App.prototype);
    var app = new Ctor();
    app.mixin('foo', function() {});
    assert.equal(typeof Ctor.prototype.foo, 'function');
  });

  it('should throw an error when Parent is not a function:', function(cb) {
    try {
      extend('foo');
      cb(new Error('expected an error'));
      cb();
    } catch (err) {
      assert.equal(err.message, 'expected Parent to be a function.');
      cb();
    }
  });

  it('should throw an error when Ctor is not a function:', function(cb) {
    try {
      extend(function Foo() {})('bar')
      cb(new Error('expected an error'));
      cb();
    } catch (err) {
      assert.equal(err.message, 'expected Ctor to be a function.');
      cb();
    }
  });
});

