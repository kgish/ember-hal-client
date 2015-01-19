import Ember from 'ember';

export default Ember.Controller.extend({
    // Requires the sessions controller
    needs: ['sessions'],

    actions: {
        signupUser: function() {
            console.log('UsersSignupController: createUser');
            alert('Sorry, not yet implemented (be patient)');
            this.transitionToRoute('index');
            var _this = this;

            // get the data from the form
            var data = this.getProperties(
                'firstName',
                'lastName',
                'email',
                'username',
                'password',
                'password_confirmation'
            );

            // Compile the firstName & lastName into a single name property
            data.name = "#{data.firstName} #{data.lastName}";

            // Get the model passed from the UserSignupRoute
            var user = this.get('model');

            // Set the properties for the user based on the data from the form
            user.setProperties(data);

            // Save the user object into the database.
            // POST => /users
            user.save().then(
                function(user) {
                    // clear the form data
                    _this.setProperties({
                        name: null,
                        email: null,
                        username: null,
                        password: null,
                        password_confirmation: null
                    });

                    // Get the sessions controller object and set the properties to proceed to the login action
                    var sessionsController = this.get('controllers.sessions');
                    sessionsController.setProperties({
                        username_or_email: data.username,
                        password: data.password
                    });

                    // Remove the record from the localstorage to avoid
                    // duplication on the users list as it is returned by
                    // the server.
                    user.deleteRecord();

                    // Call the loginUser action to authenticate the created user
                    sessionsController.send('loginUser');
                },
                function(error) {
                    // If server returns HTTP status 401 Unauthorized, create an
                    // errors object to return to the user
                    if (error.status === 401) {
                        var errs = JSON.parse(error.responseText);
                        user.set('errors', errs.errors);
                    }
                }
            ); // save().then()
        }
    }
});
