export function initialize(container, application) {
    application.inject('controller', 'cookie', 'cookie:main');
    //var t = Ember.$.cookie('access_token') || 'undefined';
    //var cu = Ember.$.cookie('auth_user');
    //var s = cu ? '{id:'+cu.id+',name:'+cu.name+',username:'+cu.username+',email'+cu.email+',is_admin:'+cu.is_admin+',login_date:'+cu.login_date+'}' : 'undefined';
    //console.log('ApplicationInitialize: currentUser={'+s+'},token='+t);
}

export default {
    name: 'application',
    after: ['cookie'],
    initialize: initialize
};
