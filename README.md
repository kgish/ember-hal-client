# Ember HAL Template

This is a simple web client template for setting up an Ember application
that communicates with a compatible HAL/JSON web service, for example
[ruby-webmachine-roar-template](https://github.com/kgish/ruby-webmachine-roar-template).

![](images/screenshot-1.png?raw=true)

## Prerequisites

You will need the following things properly installed on your computer.

* [Git](http://git-scm.com/)
* [Node.js](http://nodejs.org/) (with NPM)
* [Bower](http://bower.io/)
* [Ember CLI](http://www.ember-cli.com/)
* [PhantomJS](http://phantomjs.org/)

## Installation

In order to install and start this application, run the following commands.

```bash
$ git clone https://github.com/kgish/ember-hal-template hal-client
$ cd hal-client
$ npm install
$ bower install
```

## Configuration

Although the defaults work out of the box, you might have to configure certain
parameters in order to get the application to work properly.

This is accomplished by editing the file `config/environment.js` and making
the following changes.

### RESTAdapter host

```javascript
module.exports = function(environment) {
  var ENV = {
    ...
    },

    APP: {
      RESTADAPTER_HOST: 'http://0.0.0.0:8080'
    }
  };
  ...

  return ENV;
};
```

## Running / Development

```
Start the client by running the following command.

```bash
$ ember server
version: 0.1.6
Livereload server on port 35729
Serving on http://0.0.0.0:4200/
```

After which you can fire up you favorite browser and point it
to [http://localhost:4200](http://localhost:4200).

### Running Tests

* `ember test`
* `ember test --server`

### Building

* `ember build` (development)
* `ember build --environment production` (production)

### Deploying

This is what it takes to deploy this application.

## HAL Serializer (kind of)

In order to get this application running properly with the ember default
`RESTAdapter`, I had to do some serious tweaking.

The server will return HAL/JSON payload which looks needs to be
reformatted before passing on to the client.

For a `single` resource, the incoming payload from the API Server looks
likes this:

```javascript
payload = {
    _links: {
        self: {
            href: '/products/5'
        },
        curies: [
            {
                name:      'ht',
                href:      'http://0.0.0.0:8080:/rels/{rel}',
                templated: true
            }
        ]
    },
    name:     'horse',
    category: 'animal',
    price:    3021
}
```

Which needs to be converted to this:

```javascript
payload = {
    product: {
        id:       5,
        name:     'horse',
        category: 'animal',
        price:    3021
    }
}
```

For a `collection` of resources, the incoming payload from the API Server
will look like this:

```javascript
payload = {
    _links: {
        self: {
            href: '/products'
        },
        curies: [
            {
                name:      'ht',
                href:      'http://localhost:8080:/rels/{rel}',
                templated: true
            }
        ],
        ht:product: [
            {
                'href':     '/products/1',
                'name':     'dragon',
                'category': 'health',
                'price':    2241
            },
            ...
        ]
    }
}
```

Which needs to be converted to this:

```javascript
payload = {
    products: [
        {
            id:         5,
            name:     'horse',
            category: 'animal',
            price:    3021
        },
        ...
    ]
}
```

This is achieved by extending the default `ProductSerializer` and redefining
the `normalizePayload` hook like this:

```javascript
App.ProductSerializer = DS.RESTSerializer.extend({
    ...
    normalizePayload: function(payload) {
        var normalizedPayload = {};
        if (payload['_links']) {
            var links = payload['_links'],
                href = links['self']['href'];
            if (href === '/products') {
                normalizedPayload = this._normalizeCollection(payload)
            } else {
                normalizedPayload = this._normalizeResource(payload)
            }
        }
        return normalizedPayload;
    },

    /* private */

    _normalizeResource: function(payload) {
        var links = payload['_links'],
            href = links['self']['href'],
            id = href.replace(/^\/[^\/]+\//, ''),
            normalizedPayload = {
            product: {
                id:       id,
                name:     payload['name'],
                category: payload['category'],
                price:    payload['price']
            }
        };
        return normalizedPayload;
    },

    _normalizeCollection: function(payload) {
        var links = payload['_links'],
            href = links['self']['href'],
            products = links['ht:product'];
        var list = [];
        products.forEach(function(product){
            var id = product.href.replace(/^\/[^\/]+\//, '');
            list.push({
                id:       id,
                name:     product['name'],
                category: product['category'],
                price:    product['price']
            });
        });
        return { products: list };
    }
});
```

The same will need to be done with the `user` resource, or in the future any
newer resources that must be accessed by the client.

## HAL Serializer (Pro)

Of course, this is not very efficient having to copy code for each resource,
so a better more generic handling should be done centrally at the level of
the `ApplicationSerializer`. 

In order to achieve this, we generate an ember-cli blueprint:
```bash
$ ember-cli generate serializer application
```
Which creates the file `app/serializers/application.js` and after proper
modification should look something like this:

```javascript
import DS from 'ember-data';

export default DS.RESTSerializer.extend({
    ...
    normalizePayload: function(payload) {
        var normalizedPayload = {};
        if (payload['_links']) {
            var links = payload['_links'],
                href = links['self']['href'],
                m = href.match(/^\/([^\/]+)s(\/(.*))?$/); // See below.
            var idn = m[3] || 'none';
            if (m[3]) {
                normalizedPayload = this._normalizeResource(payload, m[1], m[3])
            } else {
                normalizedPayload = this._normalizeCollection(payload, m[1], 'ht')
            }
        }
        return normalizedPayload;
    },

    /* private */

    _normalizeResource: function(payload, resource, id) {
        var normalizedPayload = {};
        normalizedPayload[resource]['id'] = id;
        for (var key in payload) {
            if (key === '_links') continue;
            normalizedPayload[resource][key] = payload[key];
        }
        return normalizedPayload;
    },

    _normalizeCollection: function(payload, resource, name) {
        var normalizedPayload = {};
        var links = payload['_links'],
            resources = links[name+':'+resource];
        var list = [];
        resources.forEach(function(resource) {
            var id = resource.href.replace(/^\/[^\/]+\//, ''); // See below.
            var next = {};
            next['id'] = id;
            for (var key in resource) {
                if (key === 'href') continue;
                next[key] = resource[key];
            }
            list.push(next);
        });
        normalizedPayload[resource+'s'] = list;
        return normalizedPayload;
    }
});
```

You are probably scratching your head trying to get to grips with those two
mangled-looking regular expressions I used, so I will try and explain them.

```javascript
m = href.match(/^\/([^\/]+)s(\/(.*))?$/);
```

The value of href is either '/{name}s' or '/{name}s/id'

* If href = `/products` then `m[1,2,3] = 'product', undefined, undefined`
* If href = `/products/22` then `m[1,2,3] = 'product', '/22', '22'`

Therefore if `m[3]` is undefined then payload is a `collection` otherwise
it's a plain-vanilla `resource` with `id = m[3]`.

For this demo application, resource = `product` or `user` but this generic
serializer should handle any other resource from the HAL/JSON.

```javascript
id = resource.href.replace(/^\/[^\/]+\//, '');
```

Given a string like `/products/23` strip off the beginning and return the
terminating string after the last backlash resulting in `23`.

## Todo list

There are still a number of minor issues which should be looked into, namely
the following:

* Refreshing the page nukes the current user.
* Need to implement better error handling.
* Message/error banner for generic handling of user info.
* Migrate to ember-cli-simple-auth.
* Restrict access for non admins, e.g. /secret or /products/2/edit.
* Global flags isAuthenticated, isAdmin and currentUser not DRY, need to be handled more elegantly.
* Enable the registration via signup.
* Should be able to edit own profile including new password.
* Adding, modifying and deleting user by admin.
* Entry field validations.
* Pagination for the products list would be nice.

## Thanks

I had a look at the [Ember Data HAL Adapter](https://github.com/locks/ember-data-hal-adapter)
written by [Ricardo Mendes](https://github.com/locks), but unfortunately could
not get it to work.

However, reading through the code was very enlightening and gave me the
opportunity to pull out some valuable code snippets, thanks.

## References

Here is a list of important references which I found very useful.

* [Authentication in ember.js](http://log.simplabs.com/post/53016599611/authentication-in-ember-js)
* [(Better) Authentication in ember.js](http://log.simplabs.com/post/57702291669/better-authentication-in-ember-js)
* [Ember Data HAL Adapter](https://github.com/locks/ember-data-hal-adapter)
* [Ember Data Local Storage Adapter](https://github.com/kurko/ember-localstorage-adapter)
* [Emberjs Authentication the right way](http://webcloud.info/blog/2014/04/07/emberjs-authentication-the-right-way-javascript-version/) ([example](https://github.com/WebCloud/EmberJS-Auth-Example))
* [HTTP 1.1 Headers Status](http://upload.wikimedia.org/wikipedia/commons/8/88/Http-headers-status.png)

## Further Reading / Useful Links

* [ember.js](http://emberjs.com/)
* [ember-cli](http://www.ember-cli.com/)
* [ember inspector for chrome](https://chrome.google.com/webstore/detail/ember-inspector/bmdblncegkenkacieihfhpjfppoconhi)

## Author

Kiffin Gish <kiffin.gish@planet.nl>
