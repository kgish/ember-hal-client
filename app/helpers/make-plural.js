import Ember from 'ember';

export function makePlural(input, options) {
    if (options) {
        var single = options.hash['single'];
        var plural = options.hash['plural'] || single + 's';
        return (input === 1) ? single : plural;
    } else {
        return 'ERROR (options missing)';
    }
}

export default Ember.Handlebars.makeBoundHelper(makePlural);
