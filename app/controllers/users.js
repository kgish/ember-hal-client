import Ember from 'ember';

export default Ember.ArrayController.extend({
    sortAscending: true,
    sortProperties: ['id'],

    isEditing: false,
    readOnly: function() { return !this.get('isEditing') }.property('isEditing'),

    validUser: function(user, f) {
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

    actions: {
        createUser: function() {
            console.log('UsersController: Create user');
            this.transitionToRoute('users.new');
        }
    },

    /* private */

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
