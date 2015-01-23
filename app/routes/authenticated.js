import Ember from 'ember';
import config from './../config/environment';

// This is the base object for any authentication protected route with the
// required verifications. Refers to config.APP.BLACKLIST_TARGETS for
// blocking transitions of users not authenticated (admin).
//
// Subclass/extend by declaring it like this:
//
//   import Authenticated from './authenticated';
//
//   export default Authenticated.extend({
//       ...
//   });
export default Ember.Route.extend({
    // Verify that the 'token' property of the sessions controller is set
    // before continuing with the request. If not, then redirect to the
    // login route (sessions).
    beforeModel: function(transition) {
        var currentRouteName = this.controllerFor('application').get('currentRouteName');
        var currentPath = this.controllerFor('application').get('currentPath');
        var targetName = transition.targetName;
        console.log('AuthenticatedRoute: beforeModel() currentRouteName='+currentRouteName+', currentPath='+currentPath+', targetName='+targetName);

        // Check if already logged in by accessing the sessions controller for token.
        var controller = this.controllerFor('sessions');
        if (Ember.isEmpty(controller.get('token'))) {
            console.log('AuthenticatedRoute: beforeModel() => user is not authenticated, redirect to login');
            return this.redirectToLogin(transition);
        }

        // User has logged in but is he allowed to transition here?
        var isAdmin = controller.get('currentUser.is_admin');
        if (isAdmin) {
           // This guy can do anything.
            console.log('AuthenticatedRoute: beforeModel() => is_admin, can do anything');
        } else {
            // Not admin, some restrictions may apply.
            if ( config.APP.BLACKLIST_TARGETS.indexOf(targetName) != -1) {
                // Not allowed, redirect to not found page.
                console.log('AuthenticatedRoute: beforeModel() => targetName='+targetName+', user blocked');
                transition.abort();
                this.transitionTo('/not-found');
            } else {
                // Okay free passage.
                console.log('AuthenticatedRoute: beforeModel() => targetName='+targetName+', user okay');

            }
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
                this.transitionTo('error');
            }
        }
    }
});

