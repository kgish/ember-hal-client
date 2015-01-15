import DS from 'ember-data';

export default DS.Model.extend({
  name:       DS.attr('string'),
  email:      DS.attr('string'),
  username:   DS.attr('string'),
  password:   DS.attr('string'),
  password_confirmation: DS.attr('string'),
  access_token: DS.attr('string'),
  is_admin:   DS.attr('boolean'),
  login_date: DS.attr('date'),
  apiKeys:    DS.hasMany('apiKey'),
  errors:     {}
});
