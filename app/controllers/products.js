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

    //TODO make this globally accessible also for edit product.
    validProduct: function(product, f) {
        var name = product.get('name'),
            category = product.get('category'),
            price = product.get('price'),
            re = new RegExp('^\\d+$');

        if (!this._validString(name, 'name', f)) { return false; }
        if (!(price && re.test(price.trim()))) {
            if (f) { alert('Invalid price (must be a number)'); }
            return false;
        }
        if (!this._validString(category, 'category', f)) { return false; }
        return true;
    },

    actions: {
        createProduct: function() {
            console.log('ProductsController: Create product');
            this.transitionToRoute('products.new');
        }
    },

    /* private */

    _validString: function(s, n, f) {
        if (!(s && s.trim().length)) {
            if (f) { alert('Invalid '+n+' (must be a non-empty string)'); }
            return false;
        }
        return true;
    }
});
