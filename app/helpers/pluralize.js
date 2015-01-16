import Ember from 'ember';

export function pluralize(number, options) {
    var single = options.hash['single'];
    var plural = options.hash['plural'] || single + 's';
    return (number === 1) ? single : plural;
}

export default Ember.Handlebars.makeBoundHelper(pluralize);
