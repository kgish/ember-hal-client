import Ember from 'ember';

export function yesno(input) {
  return input ? 'yes' : 'no';
}

export default Ember.Handlebars.makeBoundHelper(yesno);
