import Ember from 'ember';

export default Ember.ObjectController.extend({
    needs: ['sessions', 'users'],

    isEditing: Ember.computed.alias('controllers.users.isEditing'),
    isAdmin: Ember.computed.alias('controllers.sessions.currentUser.is_admin'),

    actions: {
        saveNewUser: function() {
            var user = this.get('model');
            console.log('UsersNewController: saveNewUser() => '+JSON.stringify(user));
            if (this._validUser(user, true)) {
                user.set('name', user.get('name').trim());
                user.set('username', user.get('username').trim());
                user.set('email', user.get('email').trim());
                user.set('is_admin', user.get('is_admin'));
                user.save();
                this.set('isEditing', false);
                this.transitionToRoute('user', user);
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
    },

    /* private */

    //TODO make this globally accessible also for edit user.
    _validUser: function(user, f) {
        var name = user.get('name'),
            username = user.get('username'),
            email = user.get('email');

        if (!this._validString(name, 'name', f)) { return false; }
        if (!this._validString(username, 'username', f)) { return false; }
        if (!this._validEmail(email, f)) { return false; }
        return true;
    },

    _validEmail: function(email, f) {
        // var re = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;
        // TODO
        return true;
    },

    _validString: function(s, n, f) {
        if (!(s && s.trim().length > 4)) {
            if (f) { alert('Invalid '+n+' (must be at least 5 characters)'); }
            return false;
        }
        return true;
    }
});
