import Ember from 'ember';
import config from './../config/environment';

export default Ember.Route.extend({
    model: function() {
        var url = config.APP.RESTADAPTER_HOST;
        console.log('RootRoute: model() => getJSON('+url+')');
        Ember.$.ajaxSetup({ contentType: 'application/json; charset=utf-8' });
        var _this = this;
        return Ember.$.getJSON(url).then(
            function(response) {
                console.log('RootRoute: model() => OK, response='+JSON.stringify(response));
                return JSON.stringify(response, null, '  ');
            },
            function(error) {
                // TODO Handle errors better in gui
                var errmsg = 'RootRoute: model() => NOK, error='+JSON.stringify(error);
                console.log(errmsg);
                _this.transitionTo('error');
            }
        );
    }
});
