import Ember from 'ember';

// TODO: not DRY (see application.js)
export default Ember.Controller.extend({
    // Requires the sessions controller
    needs: ['sessions'],

    currentUser: (function() {
        var res = this.get('controllers.sessions.currentUser');
        console.log('ApplicationController: currentUser => '+JSON.stringify(res));
        return res;
    }).property('controllers.sessions.currentUser'),

    isAuthenticated: (function() {
        var res = !Ember.isEmpty(this.get('controllers.sessions.currentUser'));
        console.log('ApplicationController: isAuthenticated => '+res);
        return res;
    }).property('controllers.sessions.currentUser'),
});
