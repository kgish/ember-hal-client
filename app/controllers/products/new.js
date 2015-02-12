import Ember from 'ember';

export default Ember.ObjectController.extend({
    needs: ['products'],

    isEditing: Ember.computed.alias('controllers.products.isEditing'),

    actions: {
        saveNewProduct: function() {
            var product = this.get('model');
            console.log('ProductsNewController: saveNewProduct() => '+JSON.stringify(product));
            if (this.controllerFor('products').validProduct(product, true)) {
                product.set('name', product.get('name').trim());
                product.set('category', product.get('category').trim());
                product.set('price', product.get('price').trim());
                product.save();
                this.set('isEditing', false);
                this.transitionToRoute('product', product);
            } else {
                return false;
            }
        },
        cancelNewProduct: function() {
            var product = this.get('model');
            product.destroyRecord();
            this.set('isEditing', false);
            console.log('ProductNewController: Create product => cancelled');
            this.transitionToRoute('products');
        }
    }
});
