import Authenticated from './../authenticated';

export default Authenticated.extend({
    actions: {
        didTransition: function() {
            console.log('ProductEditRoute: didTransition()');
            this.controller.set('isEditing', true);
            return true;
        }
    }
});
