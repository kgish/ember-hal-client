# Ember HAL Template

This is a simple web client template for setting up an Ember application
that communicates with a HAL/JSON web service
using [HyperResource](https://github.com/gamache/hyperresource).

![](images/screenshot.png?raw=true)

## Instructions

In order to install and start this application, run the following commands.

```bash
    $ git clone https://github.com/kgish/ember-hal-template hal-client
    $ cd hal-client
    $ bundle install
```

Configure the RESTAdapter by editing the file `js/app.js` and modifying the `host` like this:

```javascript
// js/app.js
DS.RESTAdapter.reopen({
    host: 'http://0.0.0.0:8080' // <= change ip and port
});
```

Start the client by running the following command.

    $ python -m SimpleHTTPServer
    Serving HTTP on 0.0.0.0 port 8000 ...

After which you can fire up you favorite browser and point it
to [http://localhost:8000](http://localhost:8000).

## HAL Adapter

In order to get this application running properly with the ember default
`RESTAdapter`, I had to do some serious tweaking.

The server will return HAL/JSON payload which looks something like this:

```javascript
{products: [{product: {attributes}},{...}]
```

which before being passed through to the `RESTAdapter` needs to be converted
into this:

```javascript
    {products: [{attributes},{...}]
````

This is achieved by extending the default `ProductSerializer` and redefining
the `normalizePayload` hook like this:

```javascript
App.ProductSerializer = DS.RESTSerializer.extend({
    normalizePayload: function(payload) {
        if (payload.products) {
            var normalizedPayload = { products: [] };
            payload.products.forEach(function(item){
                normalizedPayload.products.pushObject(item.product);
            });
            payload = normalizedPayload;
        }
        return payload;
    }
    ...
});
```

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
