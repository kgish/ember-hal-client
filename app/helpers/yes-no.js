import Ember from 'ember';

export default Ember.Handlebars.makeBoundHelper(function(input) {
    return input ? 'yes' : 'no';
});
