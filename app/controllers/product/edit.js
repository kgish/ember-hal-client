import Ember from 'ember';

export default Ember.ObjectController.extend({
    needs: ['products'],

    isEditing: Ember.computed.alias('controllers.products.isEditing'),

    actions: {
        saveEditProduct: function(product) {
            this.set('isEditing', false);
            product.save();
            console.log('ProductEditController: Save product => '+product.get('name'));
            this.transitionToRoute('product', product);
        },
        cancelEditProduct: function(product) {
            this.set('isEditing', false);
            product.rollback();
            console.log('ProductEditController: Cancel product => '+product.get('name'));
            this.transitionToRoute('product', product);
        }
    }
});
