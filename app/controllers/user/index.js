import Ember from 'ember';

// TODO: not DRY (see application.js)
export default Ember.ObjectController.extend({
    // Requires the sessions controller
    needs: ['sessions', 'users'],

    // Computes aliases.
    isEditing: Ember.computed.alias('controllers.users.isEditing'),
    currentUser: Ember.computed.alias('controllers.sessions.currentUser'),

    canDelete: function() {
        return this.get('currentUser.id') != this.get('model.id');
    }.property('currentUser.id', 'model.id'),

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
            var id = user.get('id'),
                username = user.get('username');
            if (confirm('Are you sure you want to delete user '+username+' ('+id+') ?')) {
                console.log('UserIndexController: Delete user => '+username);
                user.destroyRecord(); // => DELETE to /users/id
                this.transitionToRoute('users');
            } else {
                console.log('UserIndexController: Delete user => Cancelled');
            }
        },
        nextUser: function(user) {
            this.transitionToRoute('user.index', this._gotoNextOrPrev(user, 'next'));
        },
        prevUser: function(user) {
            this.transitionToRoute('user.index', this._gotoNextOrPrev(user, 'prev'));
        }
    },

    _gotoNextOrPrev: function(user, next) {
        var content = this.get('controllers.users.content'),
            found = -1,
            cnt = 0,
            users = [];
        content.forEach(function(u){
            users.pushObject(u);
            if (found == -1) {
                if (u.id == user.id) {
                    found = cnt;
                }
            }
            cnt++;
        });
        if (found != -1) {
            if (next === 'next') {
                if (++found == cnt) found = 0;
            } else {
                if (--found == -1) found = cnt - 1;
            }
            var id = users[found].id;
            console.log('UserIndexController: '+next+' user => id = '+id);
            return id;
        } else {
            console.log('UserIndexController: '+next+' user => FAILED!');
            return user.id;
        }
    }
});
