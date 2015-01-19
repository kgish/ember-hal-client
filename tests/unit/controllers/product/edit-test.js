import {
  moduleFor,
  test
} from 'ember-qunit';

moduleFor('controller:product/edit', 'ProductEditController', {
  // Specify the other units that are required for this test.
  needs: ['controller:sessions', 'controller:products']
});

// Replace this with your real tests.
test('it exists', function() {
  var controller = this.subject();
  ok(controller);
});
