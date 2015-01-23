import {
  moduleFor,
  test
} from 'ember-qunit';

moduleFor('controller:users/user', 'UsersUserController', {
  needs: ['controller:sessions']
});

// Replace this with your real tests.
test('it exists', function() {
  var controller = this.subject();
  ok(controller);
});
