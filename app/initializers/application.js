import Ember from 'ember';

export function initialize(/*container, application*/) {
    var t = Ember.$.cookie('access_token') || 'undefined';
    var cu = Ember.$.cookie('auth_user');
    var s = cu ? JSON.stringify(cu) : 'undefined';
    console.log('ApplicationInitialize: currentUser='+s+',token='+t);
}

export default {
    name: 'application',
    initialize: initialize
};
