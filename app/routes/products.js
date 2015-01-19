import Ember from 'ember';

export default Ember.Route.extend({
    model: function() {
        console.log('ProductsRoute: model()');
        return this.store.find('product');
    }
});
