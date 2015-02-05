import Ember from 'ember';
import startApp from '../helpers/start-app';

var App;

module('Integration - Signup Page', {
  setup: function() {
    App = startApp();
  },
  teardown: function() {
    Ember.run(App, 'destroy');
  }
});

test('Should navigate to the signup page', function() {
    visit('/').then(function() {
        click("a:contains('Sign up')").then(function() {
            equal(find('h2.page-header').text(), 'Signup');
        });
    });
});
