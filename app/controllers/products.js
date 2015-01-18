import Ember from 'ember';

export default Ember.ArrayController.extend({
    needs: ['sessions'],
    isEditing: false,

    sortAscending: true,
    sortProperties: ['name'],
    itemController: 'product',

    isAdmin: (function() {
        var res = this.get('controllers.sessions.currentUser.is_admin');
        console.log('ProductsController: currentUser='+res);
        return res;
    }).property('controllers.sessions.currentUser'),

    actions: {
        createProduct: function() {
            console.log('ProductsController: Create product');
            this.transitionToRoute('products.new');
        }
    }
});
