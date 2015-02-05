//import Authenticated from './authenticated';
//
//export default Authenticated.extend({
//});
import Authenticated from './authenticated';

export default Authenticated.extend({
    model: function() {
        // Instantiate the model for the UsersController as a list of created users
        console.log('UsersRoute: model()');
        return this.store.find('user');
    }
});
