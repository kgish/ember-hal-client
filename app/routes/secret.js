// import Ember from 'ember';

// TODO: Only allow admin to transition to this route.
import Authenticated from './authenticated';

export default Authenticated.extend({
//export default Ember.Route.extend({
    model: function() {
        // Instantiate the model for the SecretController as a list of created users
        console.log('SecretRoute: model()');
        return this.store.find('user');
    }
});
