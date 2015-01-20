import Ember from 'ember';

// TODO: not DRY (see application.js)
export default Ember.ObjectController.extend({
    // Requires the sessions controller
    needs: ['sessions'],

    isAdmin: (function() {
        var res = this.get('controllers.sessions.currentUser.is_admin');
        console.log('UsersUserController: isAdmin => '+res);
        return res;
    }).property('controllers.sessions.currentUser'),

    actions: {
        editProfile: function() {
            console.log('UsersUserController: edit profile');
            alert('Sorry, not yet implemented.');
            //this.transitionToRoute('users.edit');
        },
        nextProfile: function() {
            console.log('UsersUserController: next profile');
            alert('Sorry, not yet implemented.');
            //this.transitionToRoute('users.edit');
        },
        prevProfile: function() {
            console.log('UsersUserController: previous profile');
            alert('Sorry, not yet implemented.');
            //this.transitionToRoute('users.edit');
        }
    }
});
