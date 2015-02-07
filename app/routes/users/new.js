import Authenticated from './../authenticated';

export default Authenticated.extend({
    model: function() {
        console.log('UsersNewRoute: model()');
        return this.store.createRecord('user');
    },
    actions: {
        didTransition: function() {
            console.log('UsersNewRoute: didTransition()');
            this.controller.set('isEditing', true);
            return true;
        }
    }
});
