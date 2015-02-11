import Ember from 'ember';

export default Ember.ObjectController.extend({
    needs: ['sessions', 'users'],

    isEditing: Ember.computed.alias('controllers.users.isEditing'),
    readOnly: Ember.computed.alias('controllers.users.readOnly'),
    isAdmin: Ember.computed.alias('controllers.sessions.currentUser.is_admin'),

    actions: {
        saveNewUser: function() {
            var user = this.get('model');
            console.log('UsersNewController: saveNewUser() => '+JSON.stringify(user));
            if (this.controllerFor('users').validUser(user, true)) {
                user.set('name', user.get('name').trim());
                user.set('username', user.get('username').trim());
                user.set('email', user.get('email').trim());
                user.set('is_admin', user.get('is_admin'));
                user.set('password', user.get('password'));
                user.set('password_confirmation', user.get('password_confirmation'));
                user.save();
                this.set('isEditing', false);
                this.transitionToRoute('users');
            } else {
                return false;
            }
        },
        cancelNewUser: function() {
            var user = this.get('model');
            user.destroyRecord();
            this.set('isEditing', false);
            console.log('UserNewController: Create user => Cancelled');
            this.transitionToRoute('users');
        }
    }
});
