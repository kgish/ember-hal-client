import Ember from 'ember';

export default Ember.Controller.extend({
    // Requires the sessions controller
    needs: ['sessions'],

    // Creates a computed property called 'currentUser' that will be
    // bound to the currentUser of the sessions controller and will
    // return its value.
    currentUser: (function() {
        var res = this.get('controllers.sessions.currentUser');
        console.log('ApplicationController: currentUser => '+JSON.stringify(res));
        return res;
    }).property('controllers.sessions.currentUser'),

    // Creates a computed property called 'isAuthenticated' that will be
    // bound to the currentUser of the sessions controller and will
    // verify if the object is empty.
    isAuthenticated: (function() {
        var res = !Ember.isEmpty(this.get('controllers.sessions.currentUser'));
        console.log('ApplicationController: isAuthenticated => '+res);
        return res;
    }).property('controllers.sessions.currentUser'),

    // Check if admin rights.
    isAdmin: (function() {
        var res = this.get('controllers.sessions.currentUser.is_admin');
        console.log('ApplicationController: isAdmin => '+res);
        return res;
    }).property('controllers.sessions.currentUser')
});
