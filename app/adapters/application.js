import DS from 'ember-data';
import config from './../config/environment';

export default DS.RESTAdapter.extend({
    headers: function() {
        var access_token = Ember.$.cookie('access_token') || 'none';
        console.log('ApplicationAdapter: headers() => Authorization: Bearer '+access_token);
        return access_token === 'none' ? {} : {'Authorization': 'Bearer '+access_token};
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
        console.log('ApplicationAdapter: ajaxError() => '+jqXHR.responseText);
        var err = this._super(jqXHR);
        if (jqXHR && jqXHR.status === 422) {
          var jsonErrors = Ember.$.parseJSON(jqXHR.responseText);
          return new DS.InvalidError(jsonErrors);
        } else {
          return err;
        }
    }
});

DS.RESTAdapter.reopen({
    host: config.APP.RESTADAPTER_HOST
});
