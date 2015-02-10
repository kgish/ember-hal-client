import DS from 'ember-data';

export default DS.Model.extend({
    name:       DS.attr('string'),
    email:      DS.attr('string'),
    username:   DS.attr('string'),
    password:   DS.attr('string'),
    password_confirmation: DS.attr('string'),
    access_token: DS.attr('string', { defaultValue: '' }),
    is_admin:   DS.attr('boolean', { defaultValue: false }),
    login_date: DS.attr('date', { defaultValue: 0 }),
    last_seen:  DS.attr('date', { defaultValue: 0 }),
    apikeys:    DS.hasMany('apikey'),
    errors:     {}
});
