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
            if (this._validUser(user, true)) {
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
    },

    /* private */

    //TODO make this globally accessible also for edit user.
    _validUser: function(user, f) {
        var name = user.get('name'),
            username = user.get('username'),
            email = user.get('email'),
            password = user.get('password'),
            password_confirmation = user.get('password_confirmation');

        if (!this._validString(username, 'username', f, 5)) { return false; }
        if (!this._validString(name, 'name', f, 5)) { return false; }
        if (!this._validEmail(email, f)) { return false; }
        if (!this._validString(password, 'password', f, 6)) { return false; }
        if (password !== password_confirmation) {
            alert('Password and confirmation do not match');
            return false;
        }
        return true;
    },

    _validEmail: function(email, f) {
        var ok = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/.test(email);
        if (!ok) { alert('Invalid email'); }
        return ok;
    },

    _validString: function(s, n, f, len) {
        if (!(s && s.trim().length > len-1)) {
            if (f) { alert('Invalid '+n+' (must be at least '+len+' characters)'); }
            return false;
        }
        return true;
    }
});
