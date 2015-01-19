import Ember from 'ember';

export default Ember.Route.extend({
    model: function() {
        // Define the model for the UsersSignupController as a new record from the User model
        console.log('UsersSignupRoute: model()');
        this.store.createRecord('user');
    }
});
