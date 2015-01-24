import Ember from 'ember';
import startApp from '../helpers/start-app';
import { module, click } from 'ember-qunit';

var App;

module('Integration - Login Page', {
  setup: function() {
    App = startApp();
  },
  teardown: function() {
    Ember.run(App, 'destroy');
  }
});

test('Should navigate to the help page', function() {
    visit('/').then(function() {
        click("a:contains('Help')").then(function() {
            equal(find('h2.page-header').text(), 'Help');
        });
    });
});
