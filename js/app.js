App = Ember.Application.create({
    LOG_TRANSITIONS: true,
    LOG_TRANSITIONS_INTERNAL: true,
    LOG_VIEW_LOOKUPS: false,
    LOG_ACTIVE_GENERATION: false,
    LOG_RESOLVER: false
});


// TODO handle network errors

//Ember.LOG_BINDINGS = true;

/** ADAPTERS **/
//App.ApplicationAdapter = DS.FixtureAdapter.extend({});

App.ApplicationAdapter = DS.RESTAdapter.extend({
    buildURL: function(type, id, record) {
        var url = this._super(type, id, record);
        console.log('ApplicationAdapter: buildURL(type='+type+',id='+id+') => '+url);
        return url;
    },
    ajaxSuccess: function(jqXHR, jsonPayload) {
        var res = this._super(jqXHR, jsonPayload);
        console.log('ApplicationAdapter: ajaxSuccess(jqXHR='+JSON.stringify(jqXHR)+',jsonPayload='+JSON.stringify(jsonPayload)+') => '+JSON.stringify(res));
        return res;
    },
    ajaxError: function(jqXHR) {
        var res = this._super(jqXHR);
        console.log('ApplicationAdapter: ajaxError(jqXHR='+JSON.stringify(jqXHR)+')');
        return res;
        //var error = this._super(jqXHR);
        //if (jqXHR && jqXHR.status === 422) {
        //    var jsonErrors = Ember.$.parseJSON(jqXHR.responseText);
        //    return new DS.InvalidError(jsonErrors);
        //} else {
        //    return error;
        //}
    }
});

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
    },
    ajaxSuccess: function(jqXHR, jsonPayload) {
        var res = this._super(jqXHR, jsonPayload);
        console.log('ProductAdapter: ajaxSuccess(jqXHR='+JSON.stringify(jqXHR)+',jsonPayload='+JSON.stringify(jsonPayload)+') => '+JSON.stringify(res));
        return res;
    },
    ajaxError: function(jqXHR) {
        var res = this._super(jqXHR);
        console.log('ProductAdapter: ajaxError(jqXHR='+JSON.stringify(jqXHR)+')');
        return res;
        //var error = this._super(jqXHR);
        //if (jqXHR && jqXHR.status === 422) {
        //    var jsonErrors = Ember.$.parseJSON(jqXHR.responseText);
        //    return new DS.InvalidError(jsonErrors);
        //} else {
        //    return error;
        //}
    }
});

App.ApiKeyAdapter = DS.LSAdapter.extend({
    namespace: 'emberauth-keys'
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
    this.route('about');
    this.route('help');
    this.route('admin');
    this.route('profile');
    this.route('signup');

    // Authentication stuff
    this.route('login');
    this.resource('sessions', function() {
        this.route('logout');
        this.route('login');
    });
    this.resource('users', function() {
        this.route('user', { path: '/user/:user_id' });
    });
    this.route('secret');
});

/** ROUTES **/
App.LoadingRoute = Ember.Route.extend({
    beforeModel: function() {
        console.log('LoadingRoute: beforeModel()');
        //Ember.$('.navbar-header').hide()
    },
    afterModel: function() {
        console.log('LoadingRoute: afterModel()');
        //Ember.$('.navbar-header').show()
    }
});
App.ApplicationRoute = Ember.Route.extend({
    actions: {
        logout: function() {
            this.controllerFor('sessions').reset();
            this.transitionTo('sessions');
        }
    }
});

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

// create a base object for any authentication protected route with the required verifications
// create a base object for any authentication protected route with the required verifications
App.AuthenticatedRoute = Ember.Route.extend({
    // verify if the token property of the sessions controller is set before continuing with the request
    // if it is not, redirect to the login route (sessions)
    beforeModel: function(transition) {
        if (Ember.isEmpty(this.controllerFor('sessions').get('token'))) {
            return this.redirectToLogin(transition);
        }
    },

    // Redirect to the login page and store the current transition so we can
    // run it again after login
    redirectToLogin: function(transition) {
        this.controllerFor('sessions').set('attemptedTransition', transition);
        return this.transitionTo('sessions');
    },

    actions: {
        // recover from any error that may happen during the transition to this route
        error: function(reason, transition) {
            // if the HTTP status is 401 (unauthorised), redirect to the login page
            if (reason.status === 401) {
                this.redirectToLogin(transition);
            } else {
                console.log('AuthenticatedRoute: unknown problem => '+reason.status);
            }
        }
    }
});

App.SessionsRoute = Ember.Route.extend({
    // setup the SessionsController by resetting it to avoid data from a past authentication
    setupController: function(controller, context) {
        controller.reset()
    },

    beforeModel: function(transition) {
        // before proceeding any further, verify if the token property is not empty
        // if it is, transition to the secret route
        if (!Ember.isEmpty(this.controllerFor('sessions').get('token'))) {
            this.transitionToRoute('secret');
        }
    }
});

App.SecretRoute = App.AuthenticatedRoute.extend({
    model: function() {
        // instantiate the model for the SecretController as a list of created users
        return this.store.find('user');
    }
});

/** CONTROLLERS **/
App.ApplicationController = Ember.Controller.extend({
    // requires the sessions controller
    needs: ['sessions'],

    // creates a computed property called currentUser that will be
    // binded on the curretUser of the sessions controller and will return its value
    currentUser: (function() {
        return this.get('controllers.sessions.currentUser');
    }).property('controllers.sessions.currentUser'),

    // creates a computed property called isAuthenticated that will be
    // binded on the curretUser of the sessions controller and will verify if the object is empty
    isAuthenticated: (function() {
        return !Ember.isEmpty(this.get('controllers.sessions.currentUser'));
    }).property('controllers.sessions.currentUser')
});

App.SessionsController = Ember.Controller.extend({
    // initialization method to verify if there is a access_token cookie set
    // so we can set our ajax header with it to access the protected pages
    init: function() {
        this._super();
        if (Ember.$.cookie('access_token')) {
            Ember.$.ajaxSetup({
                headers: {
                    'Authorization':'Bearer '+Ember.$.cookie('access_token')
                }
            });
        }
    },

    // Overwrite default attemptedTransition attribute from the Ember.Controller object
    attemptedTransition: null,

    // create and set the token & current user objects based on the respective cookies
    token:       Ember.$.cookie('access_token'),
    currentUser: Ember.$.cookie('auth_user'),

    // create a observer binded to the token property of this controller
    // to set/remove the authentication tokens
    tokenChanged: (function() {
        if (Ember.isEmpty(this.get('token'))) {
            Ember.$.removeCookie('access_token');
            Ember.$.removeCookie('auth_user');
        } else {
            Ember.$.cookie('access_token', this.get('token'));
            Ember.$.cookie('auth_user', this.get('currentUser'));
        }
    }).observes('token'),

    // reset the controller properties and the ajax header
    reset: function() {
        this.setProperties({
            username_or_email: null,
            password:          null,
            token:             null,
            currentUser:       null
        });
        Ember.$.ajaxSetup({
            headers: {
                'Authorization': 'Bearer none'
            }
        });
    },

    actions: {
        loginUser: function () {
            var _this = this;

            // get the properties sent from the form and if there is any attemptedTransition set
            attemptedTrans = this.get('attemptedTransition');
            data = this.getProperties('username_or_email', 'password');

            // clear the form fields
            this.setProperties({
                username_or_email: null,
                password:          null
            });

            // send a POST request to the /sessions api with the form data
            Ember.$.post('/session', data).then(function(response) {
                    // set the ajax header with the returned access_token object
                    Ember.$.ajaxSetup({
                        headers: {
                            'Authorization': 'Bearer '+response.api_key.access_token
                        }
                    });

                    // create a apiKey record on the local storage based on the returned object
                    var key = _this.get('store').createRecord('apiKey', { accessToken: response.api_key.access_token });

                    // find a user based on the user_id returned from the request to the /sessions api
                    _this.store.find('user', response.api_key.user_id).then(function(user) {
                        // set this controller token & current user properties based on the data from the user and access_token
                        _this.setProperties({
                            token:       response.api_key.access_token,
                            currentUser: user.getProperties('username', 'name', 'email')
                        });

                        // set the relationship between the User and the ApiKey models & save the apiKey object
                        key.set('user', user);
                        key.save();

                        user.get('apiKeys').content.push(key);

                        // check if there is any attemptedTransition to retry it or go to the secret route
                        if (attemptedTrans) {
                            attemptedTrans.retry();
                            _this.set('attemptedTransition', null);
                        } else {
                            _this.transitionToRoute('secret');
                        }
                    }); // find.then
                },
                function(error) {
                    if (error.status === 401) {
                        // if there is a authentication error the user is informed of it to try again
                        alert("wrong user or password, please try again");
                    }
                }
            ); // post.then
        }
    }
});

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
            product.save();
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
            if (this.validProduct(product, true)) {
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
            console.log('ProductNewController: Create product => Cancelled');
            this.transitionToRoute('products');
        }
    },

    /* private */

    //TODO make this globally accessable also for edit product.
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

    _validString: function(s, n, f) {
        if (!(s && s.trim().length)) {
            if (f) { alert('Invalid '+n+' (must be a non-empty string)'); }
            return false;
        }
        return true;
    }
});

/** MODELS **/
App.Product = DS.Model.extend({
    name:       DS.attr('string'),
    category:   DS.attr('string'),
    price:      DS.attr('number')
});

App.User = DS.Model.extend({
    name:       DS.attr('string'),
    email:      DS.attr('string'),
    username:   DS.attr('string'),
    password:   DS.attr('string'),
    password_confirmation: DS.attr('string'),
    apiKeys:    DS.hasMany('apiKey'),
    errors:     {}
});

App.ApiKey = DS.Model.extend({
    accessToken: DS.attr('string'),
    user:       DS.belongsTo('user', { async: true })
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
