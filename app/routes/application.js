import Ember from 'ember';

export default Ember.Route.extend({
    actions: {
        logout: function() {
            console.log('ApplicationRoute: logout()');
            this.controllerFor('sessions').reset();
            this.transitionTo('index');
        }
    }
});
