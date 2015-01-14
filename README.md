# Ember HAL Template

This is a simple web client template for setting up an Ember application
that communicates with a compatible HAL/JSON web service, for example
[ruby-webmachine-roar-template](https://github.com/kgish/ruby-webmachine-roar-template).

![](images/screenshot-1.png?raw=true)

## Instructions

In order to install and start this application, run the following commands.

```bash
$ git clone https://github.com/kgish/ember-hal-template hal-client
$ cd hal-client
```

Configure the RESTAdapter by editing the file `js/app.js` and modifying the `host` like this:

```javascript
// js/app.js
DS.RESTAdapter.reopen({
    host: 'http://0.0.0.0:8080' // <= change ip and port
});
```

Start the client by running the following command.

```bash
$ python -m SimpleHTTPServer
Serving HTTP on 0.0.0.0 port 8000 ...
```

After which you can fire up you favorite browser and point it
to [http://localhost:8000](http://localhost:8000).

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
the `ApplicationSerializer`. This is how it looks.

```javascript
App.ApplicationSerializer = DS.RESTSerializer.extend({
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

## Author

Feel free to contact me at Kiffin Gish <kiffin.gish@planet.nl>
