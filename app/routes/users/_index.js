import Ember from 'ember';

export default Ember.Route.extend({
    beforeModel: function() {
        console.log('UsersIndexRoute: beforeModel() => transitionTo(\'users\')');
        this.transitionTo('users');
    }
});
