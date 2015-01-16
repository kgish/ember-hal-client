import Ember from 'ember';

export function truncate(input, options) {
  if (input) {
    var maxlen = options.hash['maxlen'] || 50;
    if (/\s/g.test(input)) {
      return input;
    } else if (input.length > maxlen) {
      return input.substring(0, maxlen - 4) + '...';
    } else {
      return input;
    }
  } else {
    return 'null';
  }
}

export default Ember.Handlebars.makeBoundHelper(truncate);
