import Ember from 'ember';

export default Ember.Route.extend({
    // Setup the SessionsController by resetting it to avoid data from
    // a previous authentication.
    setupController: function(controller) {
        console.log('SessionRoute: setupController()');
        controller.reset();
    },

    beforeModel: function() {
        console.log('SessionRoute: beforeModel()');
        // Before proceeding any further, first verify if the token property
        // is not empty. If it is, transition to the secret route.
        if (!Ember.isEmpty(this.controllerFor('sessions').get('token'))) {
            this.transitionToRoute('secret');
        }
    }
});
