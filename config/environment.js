/* jshint node: true */

module.exports = function(environment) {
    var ENV = {
        modulePrefix: 'hal-client',
        environment: environment,
        baseURL: '/',
        locationType: 'auto',
        EmberENV: {
            FEATURES: {
                // Here you can enable experimental features on an ember canary build
                // e.g. 'with-controller': true
            }
        },

        APP: {
            // Here you can pass flags/options to your application instance
            // when it is created
            RESTADAPTER_HOST: 'http://0.0.0.0:8080',
            BLACKLIST_TARGETS: ['users.index', 'products.new', 'product.edit'],
            SECRET_KEY_SIGNUP: '2d5b0672-b207-11e4-94cd-3c970ead4d26'
        },

        // Defaults
        contentSecurityPolicy: {
            'default-src': "'none'",
            'script-src': "'self'",
            'font-src': "'self'",
            'connect-src': "'self'",
            'img-src': "'self'",
            'style-src': "'self'",
            'media-src': "'self'"
        }
    };

    if (environment === 'development') {
        // ENV.APP.LOG_RESOLVER = true;
        // ENV.APP.LOG_ACTIVE_GENERATION = true;
        ENV.APP.LOG_TRANSITIONS = true;
        ENV.APP.LOG_TRANSITIONS_INTERNAL = true;
        // ENV.APP.LOG_VIEW_LOOKUPS = true;
    }

    if (environment === 'test') {
        // Testem prefers this...
        ENV.baseURL = '/';
        ENV.locationType = 'none';

        // keep test console output quieter
        ENV.APP.LOG_ACTIVE_GENERATION = false;
        ENV.APP.LOG_VIEW_LOOKUPS = false;

        ENV.APP.rootElement = '#ember-testing';
    }

    if (environment === 'production') {

    }

    return ENV;
};
