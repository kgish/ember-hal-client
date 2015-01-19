import Ember from 'ember';

export function formatValue(input, options) {
    var placeholder = options ? options.hash['placeholder'] : null;
    if (typeof input === 'undefined') {
        return placeholder || '[UNDEFINED]';
    } else if (input === null) {
        return placeholder || '[NULL]';
    } else if (typeof input === 'string' && input.length === 0) {
        return placeholder || '[EMPTY]';
    } else {
        return input;
    }
}

export default Ember.Handlebars.makeBoundHelper(formatValue);
