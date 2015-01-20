import Ember from 'ember';
import config from './../config/environment';

export default Ember.Controller.extend({
    // TODO Handle sessions and cookies with ember-cli-simple-auth (and ember-cli-cookie)

    // Initialization method to verify if there is an access_token cookie set
    // so we can set our ajax header with it to access the protected pages.
    init: function() {
        console.log('SessionsController: init');
        this._super();
        if (Ember.$.cookie('access_token')) {
            console.log('SessionsController: init => access_token cookie set');
            Ember.$.ajaxSetup({
                headers: {
                    'Authorization':'Bearer '+Ember.$.cookie('access_token')
                }
            });
        } else {
            console.log('SessionsController: init => access_token cookie NOT set');
        }
    },

    // Overwrite default attemptedTransition attribute from the Ember.Controller object
    attemptedTransition: null,

    // Create and set the token & current user objects based on the respective cookies
    token:       Ember.$.cookie('access_token'),
    currentUser: Ember.$.cookie('auth_user'),

    // Create a observer binded to the token property of this controller to set/remove the authentication tokens
    tokenChanged: (function() {
        if (Ember.isEmpty(this.get('token'))) {
            console.log('SessionsController: tokenChanged => remove cookies');
            Ember.$.removeCookie('access_token');
            Ember.$.removeCookie('auth_user');
        } else {
            console.log('SessionsController: tokenChanged => set cookies');
            // TODO: expire in 30 minutes.
            Ember.$.cookie('access_token', this.get('access_token'), {expires: 1});
            Ember.$.cookie('auth_user', this.get('auth_user'), {expires: 1});
            console.log('SessionsController: tokenChanged => cookie(auth_user='+Ember.$.cookie('auth_user')+',cookie(access_token)='+Ember.$.cookie('access_token')+')');
        }
    }).observes('token'),

    // reset the controller properties and the ajax header
    reset: function() {
        console.log('SessionsController: reset()');
        this.setProperties({
            username_or_email: null,
            password:          null,
            token:             null,
            currentUser:       null
        });
        Ember.$.ajaxSetup({
            headers: {
                'Authorization': 'Bearer none'
            }
        });
    },

    actions: {
        loginUser: function () {
            console.log('SessionsController: loginUser');
            var _this = this;

            // get the properties sent from the form and if there is any attemptedTransition set
            var attemptedTrans = this.get('attemptedTransition');
            var data = this.getProperties('username_or_email', 'password');

            // clear the form fields
            this.setProperties({
                username_or_email: null,
                password:          null
            });

            data = JSON.stringify(data);

            // var url = 'http://0.0.0.0:8080/session';
            var url = config.APP.RESTADAPTER_HOST + '/session';

            // send a POST request to the /sessions api with the form data
            Ember.$.ajaxSetup({contentType: 'application/json; charset=utf-8'});
            console.log('SessionsController: post(url='+url+ ',data='+data+')');
            Ember.$.post(url, data).then(
                function(response) {
                    console.log('SessionsController: post() => OK, response='+JSON.stringify(response));
                    // set the ajax header with the returned access_token object
                    console.log('SessionsController: POST(OK) access_token='+response['api_key']['access_token']);
                    Ember.$.ajaxSetup({
                        contentType: 'application/json; charset=utf-8',
                        headers: {
                            'Authorization': 'Bearer '+response['api_key']['access_token']
                        }
                    });

                    // create a apikey record on the local storage based on the returned object
                    var key = _this.get('store').createRecord('apikey', { accessToken: response['api_key']['access_token'] });
                    console.log('SessionsController: POST(OK) key='+JSON.stringify(key));

                    // find a user based on the user_id returned from the request to the /sessions api
                    var user_id = response['api_key']['user_id'];
                    console.log('SessionsController: find(\'user\',user_id='+user_id+')');
                    _this.store.find('user', user_id).then(
                        function(user) {
                            console.log('SessionsController: find() => OK, token='+response['api_key']['access_token']);
                            // set this controller token & current user properties based on the data from the user and access_token
                            _this.setProperties({
                                token:       response['api_key']['access_token'],
                                currentUser: user.getProperties('id', 'name', 'username', 'email', 'is_admin', 'login_date')
                            });

                            // set the relationship between the User and the apikey models & save the apikey object
                            key.set('user', user);
                            key.save();

                            user.get('apikeys').content.push(key);

                            // check if there is any attemptedTransition to retry it or go to the secret route
                            if (attemptedTrans) {
                                attemptedTrans.retry();
                                _this.set('attemptedTransition', null);
                            } else {
                                _this.transitionToRoute('index');
                            }
                        },
                        function(error) {
                            // TODO Handle errors better in gui
                            console.log('SessionsController: find() => NOK, error='+JSON.stringify(error));
                        }
                    ); // find().then()
                },
                function(error) {
                    // TODO Handle errors better in gui
                    console.log('SessionsController: post() => NOK, error='+JSON.stringify(error));
                    if (error.status === 401) {
                        // If there is a authentication error the user is informed of it to try again
                        alert("wrong user or password, please try again");
                    }
                }
            ); // post().then()
        }
    }
});
