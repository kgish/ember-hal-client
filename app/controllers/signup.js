import Ember from 'ember';
import config from './../config/environment';

export default Ember.ObjectController.extend({
    // Requires the sessions controller
    needs: ['sessions', 'users'],

    actions: {
        saveSignupUser: function() {
            var user = this.get('model');
            console.log('SignupController: saveSignupUser() => '+JSON.stringify(user));
            var controller = this.get('controllers.users');
            if (controller.validUser(user, true)) {
                var username = user.get('username').trim();
                user.set('username', username);
                user.set('name', user.get('name').trim());
                user.set('email', user.get('email').trim());
                user.set('is_admin', false);
                user.set('password', user.get('password'));
                user.set('password_confirmation', user.get('password_confirmation'));
                Ember.$.ajaxSetup({ headers: { 'X-Secret-Key-Signup': config.APP.SECRET_KEY_SIGNUP } });
                user.save().then(
                    function() {
                        alert('Registration succeeded. You can now login with username \''+username+'\' and the password you entered.')
                    }
                );
                this.transitionToRoute('sessions');
            } else {
                return false;
            }
        },

        cancelSignupUser: function() {
            console.log('SignupController: Signup user => cancelled');
            var user = this.get('model');
            user.destroyRecord();
            this.transitionToRoute('sessions');
        }
    }
});
