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

DS.RESTAdapter.reopen({
    host: 'http://0.0.0.0:8080'
});

App.ApiKeyAdapter = DS.LSAdapter.extend({
    namespace: 'emberauth-keys'
});

/** SERIALIZERS **/
App.ApplicationSerializer = DS.RESTSerializer.extend({
    typeForRoot: function(root) {
        var res = this._super(root);
        console.log('ApplicationSerializer: typeForRoot(root='+root+') => '+res);
        return res;
    },
    normalizePayload: function(payload) {
        console.log('ApplicationSerializer: normalizePayload(payload='+JSON.stringify(payload)+')');
        var normalizedPayload = {};
        if (payload['_links']) {
            var links = payload['_links'],
                href = links['self']['href'],
                m = href.match(/^\/([^\/]+)s(\/(.*))?$/);
            /*
                The value of href is either '/{name}s' or '/{name}s/id'
                    If href = '/products' then m[1,2,3] = 'product', undefined, undefined
                    If href = '/products/22' then m[1,2,3] = 'product', '/22', '22'
                Therefore if m[3] is undefined then payload is a 'collection' otherwise
                it's a resource with a given id = m[3]

                For this demo application, resource = 'product' or 'user' but this generic
                serializer should handle any other resource from the HAL/JSON.
            */
            var idn = m[3] || 'none';
            console.log('ApplicationSerializer: normalizePayload() => href='+href+',resource='+m[1]+',id='+idn);
            if (m[3]) {
                normalizedPayload = this._normalizeResource(payload, m[1], m[3])
            } else {
                normalizedPayload = this._normalizeCollection(payload, m[1], 'ht')
            }
            console.log('ApplicationSerializer: normalizePayload() => '+JSON.stringify(normalizedPayload));
        } else {
            console.log('ApplicationSerializer: normalizePayload() => unknown payload format!');
        }
        return normalizedPayload;
    },

    /* private */

    _normalizeResource: function(payload, resource, id) {
        var normalizedPayload = {};
        normalizedPayload[resource] = {};
        normalizedPayload[resource]['id'] = id;
        for (var key in payload) {
            if (key === '_links' || key === '_embedded') continue;
            normalizedPayload[resource][key] = payload[key];
        }
        return normalizedPayload;
    },

    _normalizeCollection: function(payload, resource, name) {
        var normalizedPayload = {};
        var links = payload['_links'],
            resources = links[name+':'+resource];
        var list = [];
        resources.forEach(function(resource) {
            var id = resource.href.replace(/^\/[^\/]+\//, '');
            var next = {};
            next['id'] = id;
            for (var key in resource) {
                if (key === 'href') continue;
                next[key] = resource[key];
            }
            list.push(next);
        });
        normalizedPayload[resource+'s'] = list;
        return normalizedPayload;
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
    this.route('about');
    this.route('help');

    // Authentication stuff
    this.route('login');
    this.resource('sessions', function() {
        this.route('logout');
        this.route('login');
    });
    this.resource('users', function() {
        this.route('signup');
        this.route('user', { path: '/profile/:user_id' });
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
            console.log('ApplicationRoute: logout()');
            this.controllerFor('sessions').reset();
            this.transitionTo('index');
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

// Create a base object for any authentication protected route with the
// required verifications.
App.AuthenticatedRoute = Ember.Route.extend({
    // verify if the token property of the sessions controller is set before continuing with the request
    // if it is not, redirect to the login route (sessions)
    beforeModel: function(transition) {
        console.log('AuthenticatedRoute: beforeModel()');
        if (Ember.isEmpty(this.controllerFor('sessions').get('token'))) {
            return this.redirectToLogin(transition);
        }
    },

    // Redirect to the login page and store the current transition so we can
    // run it again after login
    redirectToLogin: function(transition) {
        console.log('AuthenticatedRoute: redirectToLogin()');
        this.controllerFor('sessions').set('attemptedTransition', transition);
        return this.transitionTo('sessions');
    },

    actions: {
        // recover from any error that may happen during the transition to this route
        error: function(reason, transition) {
            console.log('AuthenticatedRoute: error()');
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
        console.log('SessionRoute: setupController()');
        controller.reset()
    },

    beforeModel: function(transition) {
        console.log('SessionRoute: beforeModel()');
        // before proceeding any further, verify if the token property is not empty
        // if it is, transition to the secret route
        if (!Ember.isEmpty(this.controllerFor('sessions').get('token'))) {
            this.transitionToRoute('secret');
        }
    }
});

App.SecretRoute = App.AuthenticatedRoute.extend({
    model: function() {
        // Instantiate the model for the SecretController as a list of created users
        console.log('SecretRoute: model()');
        return this.store.find('user');
    }
});

App.UsersSignupRoute = Ember.Route.extend({
    model: function() {
        // Define the model for the UsersSignupController as a new record from the User model
        console.log('UsersSignupRoute: model()');
        this.store.createRecord('user');
    }
});

/** CONTROLLERS **/
App.ApplicationController = Ember.Controller.extend({
    // Requires the sessions controller
    needs: ['sessions'],

    // TODO
    hostname: 'localhost:8080',

    // TODO: Not DRY
    // creates a computed property called currentUser that will be
    // binded on the curretUser of the sessions controller and will return its value
    currentUser: (function() {
        var res = this.get('controllers.sessions.currentUser');
        console.log('ApplicationController: currentUser='+JSON.stringify(res));
        return res;
    }).property('controllers.sessions.currentUser'),

    // creates a computed property called isAuthenticated that will be
    // binded on the curretUser of the sessions controller and will verify if the object is empty
    isAuthenticated: (function() {
        var res = !Ember.isEmpty(this.get('controllers.sessions.currentUser'));
        console.log('ApplicationController: isAuthenticated='+res);
        return res;
    }).property('controllers.sessions.currentUser'),

    isAdmin: (function() {
        var res = this.get('controllers.sessions.currentUser.is_admin');
        console.log('ApplicationController: currentUser='+res);
        return res;
    }).property('controllers.sessions.currentUser')
});

App.IndexController = Ember.Controller.extend({
    // requires the sessions controller
    needs: ['sessions'],

    // TODO: not DRY need to centralize
    // creates a computed property called currentUser that will be
    // binded on the curretUser of the sessions controller and will return its value
    currentUser: (function() {
        var res = this.get('controllers.sessions.currentUser');
        console.log('IndexController: currentUser='+JSON.stringify(res));
        return res;
    }).property('controllers.sessions.currentUser'),

    // creates a computed property called isAuthenticated that will be
    // binded on the curretUser of the sessions controller and will verify if the object is empty
    isAuthenticated: (function() {
        var res = !Ember.isEmpty(this.get('controllers.sessions.currentUser'));
        console.log('IndexController: isAuthenticated='+res);
        return res;
    }).property('controllers.sessions.currentUser')
});

App.UsersSignupController = Ember.Controller.extend({
    needs: ['sessions'],

    actions: {
        signupUser: function() {
            console.log('UsersSignupController: createUser');
            alert('Sorry, not yet implemented (be patient)');
            this.transitionToRoute('index');
            var _this = this;

            // get the data from the form
            var data = this.getProperties(
                'firstName',
                'lastName',
                'email',
                'username',
                'password',
                'password_confirmation'
            );

            // Compile the firstName & lastName into a single name property
            data.name = "#{data.firstName} #{data.lastName}";

            // Get the model passed from the UserSignupRoute
            var user = this.get('model');

            // Set the properties for the user based on the data from the form
            user.setProperties(data);

            // Save the user object into the database.
            // POST => /users
            user.save().then(
                function(user) {
                    // clear the form data
                    _this.setProperties({
                        name: null,
                        email: null,
                        username: null,
                        password: null,
                        password_confirmation: null
                    });

                    // Get the sessions controller object and set the properties to proceed to the login action
                    var sessionsController = this.get('controllers.sessions');
                    sessionsController.setProperties({
                        username_or_email: data.username,
                        password: data.password
                    });

                    // Remove the record from the localstorage to avoid
                    // duplication on the users list as it is returned by
                    // the server.
                    user.deleteRecord();

                    // Call the loginUser action to authenticate the created user
                    sessionsController.send('loginUser');
                },
                // TODO
                function(error) {
                    // If server returns HTTP status 401 Unauthorized, create an
                    // errors object to return to the user
                    if (error.status == 401) {
                        var errs = JSON.parse(error.responseText);
                        user.set('errors', errs.errors)
                    }
                }
            ); // save().then()
        }
    }
});

App.SessionsController = Ember.Controller.extend({
    // Initialization method to verify if there is an access_token cookie set
    // so we can set our ajax header with it to access the protected pages.
    init: function() {
        console.log('SessionsController: init');
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

    // Create and set the token & current user objects based on the respective cookies
    token:       Ember.$.cookie('access_token'),
    currentUser: Ember.$.cookie('auth_user'),

    // Create a observer binded to the token property of this controller to set/remove the authentication tokens
    tokenChanged: (function() {
        console.log('SessionsController: tokenChanged');
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
        console.log('SessionsController: reset');
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
            console.log('SessionsController: loginUser');
            var _this = this;

            // get the properties sent from the form and if there is any attemptedTransition set
            var attemptedTrans = this.get('attemptedTransition');
            var data = this.getProperties('username_or_email', 'password');

            // clear the form fields
            this.setProperties({
                username_or_email: null,
                password:          null
            });

            data = JSON.stringify(data);

            // TODO use APP.SessionsAdapter = DS.RESTAdapter.extend()
            var url = 'http://0.0.0.0:8080/session';

            // send a POST request to the /sessions api with the form data
            Ember.$.ajaxSetup({contentType: 'application/json; charset=utf-8'});
            console.log('SessionsController: post(url='+url+ ',data='+data+')');
            Ember.$.post(url, data).then(
                function(response) {
                    console.log('SessionsController: post() => OK, response='+JSON.stringify(response));
                    // set the ajax header with the returned access_token object
                    console.log('SessionsController: POST(OK) access_token='+response['api_key']['access_token']);
                    Ember.$.ajaxSetup({
                        contentType: 'application/json; charset=utf-8',
                        headers: {
                            'Authorization': 'Bearer '+response['api_key']['access_token']
                        }
                    });

                    // create a apiKey record on the local storage based on the returned object
                    var key = _this.get('store').createRecord('apiKey', { accessToken: response['api_key']['access_token'] });
                    console.log('SessionsController: POST(OK) key='+JSON.stringify(key));

                    // find a user based on the user_id returned from the request to the /sessions api
                    var user_id = response['api_key']['user_id'];
                    console.log('SessionsController: find(\'user\',user_id='+user_id+')');
                    _this.store.find('user', user_id).then(
                        function(user) {
                            console.log('SessionsController: find() => OK, token='+response['api_key']['access_token']);
                            // set this controller token & current user properties based on the data from the user and access_token
                            _this.setProperties({
                                token:       response['api_key']['access_token'],
                                currentUser: user.getProperties('id', 'name', 'username', 'email', 'is_admin', 'login_date')
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
                                _this.transitionToRoute('index');
                            }
                        },
                        function(error) {
                            // TODO Handle errors better in gui
                            console.log('SessionsController: find() => NOK, error='+JSON.stringify(error));
                        }
                    ); // find().then()
                },
                function(error) {
                    // TODO Handle errors better in gui
                    console.log('SessionsController: post() => NOK, error='+JSON.stringify(error));
                    if (error.status === 401) {
                        // If there is a authentication error the user is informed of it to try again
                        alert("wrong user or password, please try again");
                    }
                }
            ); // post().then()
        }
    }
});

App.ProductsController = Ember.ArrayController.extend({
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

App.ProductsNewController = Ember.ObjectController.extend({
    // TODO: Not DRY
    needs: ['sessions'],
    isAdmin: (function() {
        var res = this.get('controllers.sessions.currentUser.is_admin');
        console.log('ProductsNewController: isAdmin = '+res);
        return res;
    }).property('controllers.sessions.currentUser')
});

App.ProductController = Ember.ObjectController.extend({
    // TODO: Not DRY
    needs: ['sessions'],
    isAdmin: (function() {
        var res = this.get('controllers.sessions.currentUser.is_admin');
        console.log('ProductController: isAdmin = '+res);
        return res;
    }).property('controllers.sessions.currentUser')
});

App.ProductEditController = Ember.ObjectController.extend({
    // TODO: Not DRY
    needs: ['sessions'],
    isAdmin: (function() {
        var res = this.get('controllers.sessions.currentUser.is_admin');
        console.log('ProductEditController: isAdmin = '+res);
        return res;
    }).property('controllers.sessions.currentUser')
});


App.ProductIndexController = Ember.ObjectController.extend({
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

App.ProductEditController = Ember.ObjectController.extend({
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

App.ProductsNewController = Ember.ObjectController.extend({
    needs: ['products'],
    isEditing: Ember.computed.alias('controllers.products.isEditing'),

    actions: {
        saveNewProduct: function() {
            var product = this.get('model');
            console.log('ProductsNewController: saveNewProduct() => '+JSON.stringify(product));
            if (this._validProduct(product, true)) {
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
    _validProduct: function(product, f) {
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

App.UsersUserController = Ember.ObjectController.extend({
    // TODO: Not DRY
    needs: ['sessions'],
    isAdmin: (function() {
        var res = this.get('controllers.sessions.currentUser.is_admin');
        console.log('UsersUserController: isAdmin = '+res);
        return res;
    }).property('controllers.sessions.currentUser'),

    actions: {
        editProfile: function() {
            alert('Sorry, not yet implemented (be patient)');
        }
    }
});

App.SecretController = Ember.ObjectController.extend({
    // TODO: Not DRY
    needs: ['sessions'],
    isAdmin: (function() {
        var res = this.get('controllers.sessions.currentUser.is_admin');
        console.log('SecretController: isAdmin = '+res);
        return res;
    }).property('controllers.sessions.currentUser')
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
    access_token: DS.attr('string'),
    is_admin:   DS.attr('boolean'),
    login_date: DS.attr('date'),
    apiKeys:    DS.hasMany('apiKey'),
    errors:     {}
});

App.ApiKey = DS.Model.extend({
    accessToken: DS.attr('string'),
    user:        DS.belongsTo('user', { async: true })
});

/** HANDLEBAR HELPERS **/
Ember.Handlebars.helper('truncate', function(value, options) {
    if (value) {
        var maxlen = options.hash['maxlen'] || 50;
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

Ember.Handlebars.helper('fromnow', function(context) {
    var dd = ""+context;
    var ss = dd.slice(4,24); // => Nov 11 2014 08:52:16
    console.log('Helper fromnow: '+dd);
    return new moment(ss,"MMM DD YYYY hh:mm:ss").fromNow();
});

Ember.Handlebars.helper('formatvalue', function(value, options) {
    var placeholder = options.hash['placeholder'];
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

Ember.Handlebars.helper('yesno', function(b) {
    return b ? 'yes' : 'no';
});

