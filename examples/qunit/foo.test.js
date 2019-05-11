import { foo } from './foo.js';

/* global QUnit */
QUnit.module('Foo');
QUnit.test('should fail', assert => {
  assert.equal(foo(), 42);
});
