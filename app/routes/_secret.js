import Authenticated from './authenticated';

export default Authenticated.extend({
    model: function() {
        // Instantiate the model for the SecretController as a list of created users
        console.log('SecretRoute: model()');
        return this.store.find('user');
    }
});
