import {
  moduleFor,
  test
} from 'ember-qunit';

moduleFor('controller:products/new', 'ProductsNewController', {
  // Specify the other units that are required for this test.
  needs: ['controller:products']
});

// Replace this with your real tests.
test('it exists', function() {
  var controller = this.subject();
  ok(controller);
});
