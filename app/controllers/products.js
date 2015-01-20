import Ember from 'ember';

// TODO: not DRY (see application.js)
export default Ember.ArrayController.extend({
    // Requires the sessions controller
    needs: ['sessions'],

    isEditing: false,

    sortAscending: true,
    sortProperties: ['name'],
    itemController: 'product',

    isAdmin: (function() {
        var res = this.get('controllers.sessions.currentUser.is_admin');
        console.log('ProductsController: isAdmin => '+res);
        return res;
    }).property('controllers.sessions.currentUser'),

    actions: {
        createProduct: function() {
            console.log('ProductsController: Create product');
            this.transitionToRoute('products.new');
        }
    }
});
