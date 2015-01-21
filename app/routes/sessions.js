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
        var controller = this.controllerFor('sessions');
        if (!Ember.isEmpty(controller)) {
            var token = controller.get('token');
            if (!Ember.isEmpty(token)) {
                console.log('SessionRoute: beforeModel() => transition to secret');
                this.transitionTo('secret');
            } else {
                console.log('SessionRoute: beforeModel(), token not empty => do nothing!');
            }
        } else {
            console.log('SessionRoute: beforeModel(), controllerFor(sessions) failed => do nothing!');
        }
    }
});
