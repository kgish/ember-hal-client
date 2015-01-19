import Ember from 'ember';

export default Ember.Handlebars.makeBoundHelper(function(input, options){
    var placeholder = options.hash['placeholder'];
    if (typeof input === 'undefined') {
        return placeholder || '[UNDEFINED]';
    } else if (input === null) {
        return placeholder || '[NULL]';
    } else if (typeof input === 'string' && input.length === 0) {
        return placeholder || '[EMPTY]';
    } else {
        return input;
    }
});
