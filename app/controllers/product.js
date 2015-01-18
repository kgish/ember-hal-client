import Ember from 'ember';

export default Ember.ObjectController.extend({
    // TODO: Not DRY
    needs: ['sessions'],
    isAdmin: (function() {
        var res = this.get('controllers.sessions.currentUser.is_admin');
        console.log('ProductController: isAdmin = '+res);
        return res;
    }).property('controllers.sessions.currentUser')
});
