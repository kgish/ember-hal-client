import {
  moduleFor,
  test
} from 'ember-qunit';

moduleFor('controller:product', 'ProductController', {
  // Specify the other units that are required for this test.
    needs: ['controller:sessions']
});

// Replace this with your real tests.
test('it exists', function() {
  var controller = this.subject();
  ok(controller);
});
