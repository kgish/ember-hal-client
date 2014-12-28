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
        this.resource('product', { path: ':product_id' }, function() {})
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
//        console.log('IndexRoute: redirect');
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
            console.log('ProductsIndexRoute: afterModel => product/firstObject');
            this.transitionTo('product', firstObject);
        } else {
            console.log('ProductsIndexRoute: afterModel => products');
            this.transitionTo('products');
        }
    }
});

App.ProductIndexRoute = Ember.Route.extend({
    afterModel: function() {
        var firstObject = this.modelFor('product').get('firstObject');
        if (firstObject) {
            console.log('ProductIndexRoute: afterModel => product/firstObject');
            this.transitionTo('product', firstObject);
        } else {
            console.log('ProductIndexRoute: afterModel => product');
            this.transitionTo('product');
        }
    }
});

/** CONTROLLERS **/
App.ProductsController = Ember.ArrayController.extend({
    sortAscending: true,
    sortProperties: ['name'],
    itemController: 'product',
    actions: {
        createProduct: function() {
            console.log('Create product');
        }
    }
});

App.ProductController = Ember.ObjectController.extend({
/*
    glyphicon: function() {
        var modifier;
        var name = this.get('name').toLowerCase();
        var category = this.get('ftype').toLowerCase();
        if (category === 'none') {
            switch(name) {
                case 'inbox': modifier = 'inbox'; break;
                case 'deleted items': modifier = 'trash'; break;
                case 'outbox': modifier = 'log-out'; break;
                case 'sent items': modifier = 'send'; break;
                default: modifier = 'question-sign';
            }
        } else {
            category = ftype.replace(/^ipf\./, '');
            switch(category) {
                case 'appointment': modifier = 'th'; break;
                case 'deleted items': modifier = 'trash'; break;
                case 'contact': modifier = 'user'; break;
                case 'task': modifier = 'th-list'; break;
                case 'configuration': modifier = 'cog'; break;
                case 'note': modifier = 'tag'; break;
                case 'note.outlookhomepage': modifier = 'tag'; break;
                case 'stickynote': modifier = 'tags'; break;
                case 'journal': modifier = 'book'; break;
                default: modifier = 'question-sign';
            }
        }
//        console.log('ProductController: glyphicon(name='+name+',category='+ftype+') => '+modifier);
        return 'glyphicon-'+modifier;
    }.property('name','category')
*/
    isEditing: false,

    actions: {
        editProduct: function() {
            console.log('Edit product');
            this.set('isEditing', true);
        },
        deleteProduct: function() {
            console.log('Delete product');
        },
        saveProduct: function() {
            this.set('isEditing', false);
            console.log('Save product: isEditing is '+this.get('isEditing'));
        },
        cancelProduct: function() {
            console.log('Cancel product');
            this.set('isEditing', false);
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

