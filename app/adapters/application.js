import DS from 'ember-data';

export default DS.RESTAdapter.extend({
});

DS.RESTAdapter.reopen({
  host: 'http://0.0.0.0:8080'
});
