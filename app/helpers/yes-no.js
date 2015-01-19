import Ember from 'ember';

export function yesNo(input) {
    return input ? 'yes' : 'no';
}

export default Ember.Handlebars.makeBoundHelper(yesNo);
