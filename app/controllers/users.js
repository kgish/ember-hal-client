import Ember from 'ember';

export default Ember.ArrayController.extend({
    sortAscending: true,
    sortProperties: ['id'],

    isEditing: false,

    actions: {
        createUser: function() {
            console.log('UsersController: Create user');
            this.transitionToRoute('users.new');
        }
    }

});
