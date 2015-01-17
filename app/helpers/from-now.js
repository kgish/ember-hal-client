import Ember from 'ember';
//import { moment } from 'ember-moment/computed';

export default Ember.Handlebars.makeBoundHelper(function(input){
    var dd = ""+input;
    var ss = dd.slice(4,24); // => Nov 11 2014 08:52:16
//    console.log('Helper from-now: '+dd);
    return new moment(ss,"MMM DD YYYY hh:mm:ss").fromNow();
});
