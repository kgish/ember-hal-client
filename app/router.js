import Ember from 'ember';
import config from './config/environment';

var Router = Ember.Router.extend({
    location: config.locationType
});

Router.map(function() {

    // Top-level (navbar)
    this.route('help');
    this.route('about');
    this.route('loading');
    this.route('authenticated');

    // Sessions
    this.resource('sessions', function() {
        this.route('logout');
        this.route('login');
    });
    this.route('secret');

    // Users
    this.resource('users', function() {
        this.route('signup');
        this.route('user', { path: '/profile/:user_id' });
    });

    // Products
    this.resource('products', function() {
        this.route('new');
        this.resource('product', { path: ':product_id' }, function() {
            this.route('edit');
        });
    });

    // Not found
    this.route('not-found', { path: '/*path'});
});

export default Router;
