import Ember from 'ember';
import DS from 'ember-data';
import config from './../config/environment';

export default DS.RESTAdapter.extend({
    headers: function() {
        var access_token = Ember.$.cookie('access_token');
        if (access_token) {
            console.log('ApplicationAdapter: headers() => \'Authorization: Bearer '+access_token+'\'');
            return { 'Authorization': 'Bearer '+access_token };
        } else {
            return {};
        }
    }.property().volatile(),

    buildURL: function(type, id, record) {
        var url = this._super(type, id, record);
        console.log('ApplicationAdapter: buildURL(type='+type+',id='+id+') => '+url);
        return url;
    },

    ajaxSuccess: function(jqXHR, jsonPayload)  {
        var res = this._super(jqXHR, jsonPayload);
        console.log('ApplicationAdapter: ajaxSuccess()');
        return res;
    },

    ajaxError: function(jqXHR) {
        var status = jqXHR ? jqXHR.status : 'unknown';
        console.log('ApplicationAdapter: ajaxError() => '+status+' error');
        var err = this._super(jqXHR);
        if (jqXHR && jqXHR.status === 401) {
            // TODO: There must be a better way.
            alert('An authentication error has occurred, please logout and login again.');
        } else {
            alert('Server error: '+status);
        }
        return err;
    }
});

DS.RESTAdapter.reopen({
    host: config.APP.RESTADAPTER_HOST
});
