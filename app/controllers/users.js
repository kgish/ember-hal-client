import Ember from 'ember';

export default Ember.ArrayController.extend({
    sortAscending: true,
    sortProperties: ['id'],

    isEditing: false,
    readOnly: function() {
       return !this.get('isEditing');
    }.property('isEditing'),

    actions: {
        createUser: function() {
            console.log('UsersController: Create user');
            this.transitionToRoute('users.new');
        }
    }

});
