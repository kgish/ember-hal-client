//import Ember from 'ember';
//
//export default Ember.Route.extend({
//});
import Authenticated from '../authenticated';

export default Authenticated.extend({
    model: function(params) {
        console.log('UsersUserRoute: model()');
        return this.store.find('user', params.user_id);
    }
});
