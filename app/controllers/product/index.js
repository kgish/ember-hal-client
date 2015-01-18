import Ember from 'ember';

export default Ember.ObjectController.extend({
    needs: ['products', 'sessions'],

    isEditing: Ember.computed.alias('controllers.products.isEditing'),

    // TODO: Not DRY
    isAdmin: (function() {
        var res = this.get('controllers.sessions.currentUser.is_admin');
        console.log('ProductIndexController: isAdmin = '+res);
        return res;
    }).property('controllers.sessions.currentUser'),

    actions: {
        editProduct: function(product) {
            this.set('isEditing', true);
            this.transitionToRoute('product.edit', product);
        },
        deleteProduct: function(product) {
            var id = product.get('id'),
                name = product.get('name');
            if (confirm('Are you sure you want to delete product '+name+' ('+id+') ?')) {
                console.log('ProductIndexController: Delete product => '+product.get('name'));
                product.destroyRecord(); // => DELETE to /products/id
            } else {
                console.log('ProductIndexController: Delete product => Cancelled');
            }
            this.transitionToRoute('products');
        }
    }
});
