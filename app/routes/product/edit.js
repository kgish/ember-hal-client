import Ember from 'ember';

export default Ember.Route.extend({
    actions: {
        didTransition: function() {
            console.log('ProductEditRoute: didTransition()');
            this.controller.set('isEditing', true);
            return true;
        }
    }
});
