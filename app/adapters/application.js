import DS from 'ember-data';
import config from './../config/environment';

export default DS.RESTAdapter.extend({
});

DS.RESTAdapter.reopen({
    host: config.APP.RESTADAPTER_HOST
});
