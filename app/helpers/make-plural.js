import Ember from 'ember';

export default Ember.Handlebars.makeBoundHelper(function(input, options) {
    var single = options.hash['single'];
    var plural = options.hash['plural'] || single + 's';
    return (input === 1) ? single : plural;
});
