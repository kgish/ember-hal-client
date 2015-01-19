import Ember from 'ember';

export default Ember.Route.extend({
    beforeModel: function() {
        console.log('LoadingRoute: beforeModel()');
        //Ember.$('.navbar-header').hide()
    },
    afterModel: function() {
        console.log('LoadingRoute: afterModel()');
        //Ember.$('.navbar-header').show()
    }
});
