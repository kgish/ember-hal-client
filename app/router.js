import Ember from 'ember';
import config from './config/environment';

var Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function() {
  this.route("help");
  this.route("about");
  this.resource("users", function() {
    this.route("signup");
    this.route("user");
  });
  this.resource("sessions", function() {
    this.route("logout");
    this.route("login");
  });
  this.route("secret");
});

export default Router;
