App = Ember.Application.create({
    LOG_TRANSITIONS: true,
    LOG_TRANSITIONS_INTERNAL: true
    //LOG_VIEW_LOOKUPS: true,
    //LOG_ACTIVE_GENERATION: true,
    //LOG_RESOLVER: true
});

//Ember.LOG_BINDINGS = true;

/** ADAPTERS **/
//App.ApplicationAdapter = DS.FixtureAdapter.extend({});

App.ApplicationAdapter = DS.RESTAdapter.extend({});

DS.RESTAdapter.reopen({
    host: 'http://0.0.0.0:8080'
});

App.ProductsAdapter = DS.RESTAdapter.extend({
    buildURL: function(type, id, record) {
        var url = this._super(type, id, record);
        console.log('ProductsAdapter: buildURL(type='+type+',id='+id+') => '+url);
        return url;
    }
});

App.ProductAdapter = DS.RESTAdapter.extend({
    buildURL: function(type, id, record) {
        var url = this._super(type, id, record);
        console.log('ProductAdapter: buildURL(type='+type+',id='+id+') => '+url);
        return url;
    }
});

/** SERIALIZERS **/
App.ProductSerializer = DS.RESTSerializer.extend({
    typeForRoot: function(root) {
        var res = this._super(root);
        console.log('ProductSerializer: typeForRoot(root='+root+') => '+res);
        return res;
    },
    normalizePayload: function(payload) {
        if (payload.products) {
            var normalizedPayload = { products: [] };
            payload.products.forEach(function(item){
                normalizedPayload.products.pushObject(item.product);
            });
            payload = normalizedPayload;
            console.log('ProductSerializer: normalizePayload() => '+JSON.stringify(payload));
        } else {
            console.log('ProductSerializer: normalizePayload() => do nothing');
        }
        return payload;
    }
});

/** ROUTER MAP **/
App.Router.map(function() {
    this.resource('products', function() {
        this.route('new');
        this.resource('product', { path: ':product_id' }, function() {
            this.route('edit');
        });
    });
    this.route('categories');
    this.route('users');
    this.route('admin');
    this.route('about');
    this.route('login');
});

/** ROUTES **/
//App.IndexRoute = Ember.Route.extend({
//    redirect: function() {
//        console.log('IndexRoute: redirect()');
//        this.transitionTo('products');
//    }
//});

App.ProductsRoute = Ember.Route.extend({
    model: function() {
        console.log('ProductsRoute: model()');
        return this.store.find('product');
    }
});

App.ProductsIndexRoute = Ember.Route.extend({
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

App.ProductEditRoute = Ember.Route.extend({
    actions: {
        didTransition: function() {
            console.log('ProductEditRoute: didTransition()');
            this.controller.set('isEditing', true);
            return true;
        }
    }
});

App.ProductsNewRoute = Ember.Route.extend({
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

//App.ProductIndexRoute = Ember.Route.extend({
//    afterModel: function() {
//        var firstObject = this.modelFor('product').get('firstObject');
//        if (firstObject) {
//            console.log('ProductIndexRoute: afterModel() => product/firstObject');
//            this.transitionTo('product', firstObject);
//        } else {
//            console.log('ProductIndexRoute: afterModel() => product');
//            this.transitionTo('product');
//        }
//    }
//});

/** CONTROLLERS **/
App.ProductsController = Ember.ArrayController.extend({
    isEditing: false,

//    sortAscending: true,
//    sortProperties: ['name'],
    itemController: 'product',
    actions: {
        createProduct: function() {
            console.log('ProductsController: Create product');
            this.transitionToRoute('products.new');
        }
    }
});

App.ProductController = Ember.ObjectController.extend({
});

App.ProductIndexController = Ember.ObjectController.extend({
    needs: ['products'],
    isEditing: Ember.computed.alias('controllers.products.isEditing'),
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

App.ProductEditController = Ember.ObjectController.extend({
    needs: ['products'],
    isEditing: Ember.computed.alias('controllers.products.isEditing'),
    actions: {
        saveEditProduct: function(product) {
            this.set('isEditing', false);
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

App.ProductsNewController = Ember.ObjectController.extend({
    needs: ['products'],
    isEditing: Ember.computed.alias('controllers.products.isEditing'),
    actions: {
        saveNewProduct: function() {
            var product = this.get('model');
            console.log('ProductsNewController: saveNewProduct() => '+JSON.stringify(product));
            product.save();
            this.set('isEditing', false);
            this.transitionToRoute('product', product);
        },
        cancelNewProduct: function() {
            var product = this.get('model');
            product.destroyRecord();
            this.set('isEditing', false);
            console.log('ProductNewController: Create product => Cancelled');
            this.transitionToRoute('products');
        }
    }
});

/** MODELS **/
App.Product = DS.Model.extend({
    name: DS.attr('string'),
    category: DS.attr('string'),
    price: DS.attr('number')
});

/** FIXTURES **/
App.Product.reopenClass({
  FIXTURES: [
    { id: 1, name: 'Pizza',     category: 'Food',     price: 300  },
    { id: 2, name: 'Beer',      category: 'Drink',    price: 40   },
    { id: 3, name: 'Hamburger', category: 'Food',     price: 125  },
    { id: 4, name: 'Shoes',     category: 'Clothing', price: 60   },
    { id: 5, name: 'Laptop',    category: 'Computer', price: 2000 }
  ]
});

/** HANDLEBAR HELPERS **/
Ember.Handlebars.helper('truncate', function(value, options) {
    if (value) {
        var maxlen = options.hash.maxlen || 50;
        if (/\s/g.test(value)) {
            return value;
        } else if (value.length > maxlen) {
            return value.substring(0,maxlen-4) + '...';
        } else {
            return value;
        }
    } else {
        return 'null';
    }
});

Ember.Handlebars.helper('pluralize', function(number, options) {
    var single = options.hash.single;
    return single.pluralize();
});

Ember.Handlebars.helper('formatdate', function(value, options) {
    return moment(value).format('YYYY MMM DD hh:mm')
});

Ember.Handlebars.helper('formatvalue', function(value, options) {
    var placeholder = options.hash.placeholder;
    if (typeof value === 'undefined') {
        return placeholder || '[UNDEFINED]'
    } else if (value === null) {
        return placeholder || '[NULL]'
    } else if (typeof value === 'string' && value.length === 0) {
        return placeholder || '[EMPTY]'
    } else {
        return value;
    }
});
