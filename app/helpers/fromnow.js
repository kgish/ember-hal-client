import Ember from 'ember';
import { moment } from 'ember-moment/computed';

export function fromnow(input) {
    var dd = ""+input;
    var ss = dd.slice(4,24); // => Nov 11 2014 08:52:16
    console.log('Helper fromnow: '+dd);
    return new moment(ss,"MMM DD YYYY hh:mm:ss").fromNow();
}

export default Ember.Handlebars.makeBoundHelper(fromnow);
