import Ember from 'ember';

export default Ember.ArrayController.extend({
    sortAscending: true,
    sortProperties: ['id'],

    isEditing: false
});
