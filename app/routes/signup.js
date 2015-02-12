import Ember from 'ember';

export default Ember.Route.extend({
    model: function() {
        // Define the model for the SignupController as a new record from the User model
        console.log('SignupRoute: model()');
        var user = this.store.createRecord('user');
        console.log('SignupRoute: model() user='+user);
        return user;
    }
});
