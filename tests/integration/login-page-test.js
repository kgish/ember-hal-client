import Ember from 'ember';
import startApp from '../helpers/start-app';

var App;

module('Integration - Login Page', {
  setup: function() {
    App = startApp();
  },
  teardown: function() {
    Ember.run(App, 'destroy');
  }
});

test('Should require me to login', function() {
    // Don't forget to clear cookies first
    Ember.$.removeCookie('access_token');
    Ember.$.removeCookie('auth_user');
    visit('/').then(function() {
        equal(find('h2.page-header').text(), 'Login');
    });
});
