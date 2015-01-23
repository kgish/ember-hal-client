import Ember from 'ember';

export default Ember.Route.extend({
    model: function() {
        console.log('ProductsRoute: model()');
        var access_token = this.get('controllers.sessions.token') || 'none';
        console.log('ProductsRoute: model(), access_token='+access_token);
        Ember.$.ajaxSetup({
            contentType: 'application/json; charset=utf-8',
            headers: {
                'Authorization': 'Bearer '+access_token
            }
        });
        return this.store.find('product');
    }
});
