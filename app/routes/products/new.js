import Ember from 'ember';

export default Ember.Route.extend({
    model: function() {
        console.log('ProductsNewRoute: model()');
        return this.store.createRecord('product');
    },
    actions: {
        didTransition: function() {
            console.log('ProductsNewRoute: didTransition()');
            this.controller.set('isEditing', true);
            return true;
        }
    }
});
