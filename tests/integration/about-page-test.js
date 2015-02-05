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

test('Should navigate to the about page', function() {
    visit('/').then(function() {
        click("a:contains('About')").then(function() {
            equal(find('h2.page-header').text(), 'About');
        });
    });
});
