import Ember from 'ember';

// TODO: get this working

// This is the base object for any authentication protected route with the
// required verifications. Use it like this:
//
// import Authenticated from './authenticated';
//
// export default Authenticated.Route.extend({
//     ...
// });

export default Ember.Route.extend({
    // Verify that the 'token' property of the sessions controller is set
    // before continuing with the request. If not, then redirect to the
    // login route (sessions).
    beforeModel: function(transition) {
        console.log('AuthenticatedRoute: beforeModel()');
        if (Ember.isEmpty(this.controllerFor('sessions').get('token'))) {
            return this.redirectToLogin(transition);
        }
    },

    // Redirect to the login page and store the current transition so we can
    // run it again after login
    redirectToLogin: function(transition) {
        console.log('AuthenticatedRoute: redirectToLogin()');
        this.controllerFor('sessions').set('attemptedTransition', transition);
        return this.transitionTo('sessions');
    },

    actions: {
        // recover from any error that may happen during the transition to this route
        error: function(reason, transition) {
            console.log('AuthenticatedRoute: error()');
            // If the HTTP status is 401 (unauthorised), redirect to the login page
            if (reason.status === 401) {
                this.redirectToLogin(transition);
            } else {
                console.log('AuthenticatedRoute: unknown problem => '+reason.status);
            }
        }
    }
});

