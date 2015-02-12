import Ember from 'ember';

// TODO: not DRY (see application.js)
export default Ember.ObjectController.extend({
    // Requires the sessions controller
    needs: ['sessions', 'users'],

    isEditing: Ember.computed.alias('controllers.users.isEditing'),
    readOnly: Ember.computed.alias('controllers.users.readOnly'),

    isAdmin: (function() {
        var res = this.get('controllers.sessions.currentUser.is_admin');
        console.log('UserEditController: isAdmin => '+res);
        return res;
    }).property('controllers.sessions.currentUser'),

    actions: {
        saveEditUser: function (user) {
            console.log('UserEditController: save edit user');
            if (this.controllerFor('users').validUser(user, true)) {
                user.save();
                this.set('isEditing', false);
                this.transitionToRoute('user', user);
            } else {
               return false;
            }
        },
        cancelEditUser: function (user) {
            console.log('UserEditController: cancel edit user');
            user.rollback();
            this.set('isEditing', false);
            this.transitionToRoute('users');
        }
    }
});
