import Ember from 'ember';
import config from './config/environment';

var Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function() {
  this.route("help");
  this.route("about");

  this.resource('users', function() {
    this.route('signup');
    this.route('user', { path: '/profile/:user_id' });
  });

  this.resource("sessions", function() {
    this.route("logout");
    this.route("login");
  });
  this.route("secret");

  this.resource('products', function() {
    this.route('new');
    this.resource('product', { path: ':product_id' }, function() {
      this.route('edit');
    });
  });
  this.route("loading");
});

export default Router;
