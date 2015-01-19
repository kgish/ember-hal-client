import Ember from 'ember';

// TODO: not DRY (see application.js)
export default Ember.ObjectController.extend({
    // Requires the sessions controller
    needs: ['sessions'],

    isAdmin: (function() {
        var res = this.get('controllers.sessions.currentUser.is_admin');
        console.log('ProductController: isAdmin = '+res);
        return res;
    }).property('controllers.sessions.currentUser')
});
