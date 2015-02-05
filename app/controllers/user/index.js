import Ember from 'ember';

// TODO: not DRY (see application.js)
export default Ember.ObjectController.extend({
    // Requires the sessions controller
    needs: ['sessions', 'users'],

    isEditing: Ember.computed.alias('controllers.users.isEditing'),

    isAdmin: (function() {
        var res = this.get('controllers.sessions.currentUser.is_admin');
        console.log('UserIndexController: isAdmin => '+res);
        return res;
    }).property('controllers.sessions.currentUser'),

    actions: {
        editUser: function(user) {
            console.log('UserIndexController: edit user');
            this.set('isEditing', true);
            this.transitionToRoute('user.edit', user);
        },
        deleteUser: function(user) {
            console.log('UserIndexController: delete user');
            // TODO do something
            this.transitionToRoute('users');
        },
        nextUser: function() {
            console.log('UserIndexController: next user');
            // TODO do something
            //this.transitionToRoute('user');
        },
        prevUser: function() {
            console.log('UserIndexController: previous user');
            // TODO do something
            //this.transitionToRoute('user');
        }
    }
});
