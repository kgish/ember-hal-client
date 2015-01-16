import Ember from 'ember';

export default Ember.Route.extend({
    afterModel: function() {
        var firstObject = this.modelFor('products').get('firstObject');
        if (firstObject) {
            console.log('ProductsIndexRoute: afterModel() => product/firstObject');
            this.transitionTo('product', firstObject);
        } else {
            console.log('ProductsIndexRoute: afterModel() => products');
            this.transitionTo('products');
        }
    }
});
