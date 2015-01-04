# HAL/JSON Client Template

This is a simple web client template for setting up an Ember application
that communicates with a HAL/JSON web service
using [HyperResource](https://github.com/gamache/hyperresource).

![](images/screenshot.png?raw=true)

## Instructions

In order to install and start this application, run the following commands.

    $ git clone https://github.com/kgish/ember-hal-template hal-client
    $ cd hal-client
    $ bundle install

Start the client by running the following command.

    $ python -m SimpleHTTPServer

After which you can fire up you favorite browser and point it
to [http://localhost:8000](http://localhost:8000).

## HAL Adapter

In order to get this application running properly with the ember default
`RESTAdapter`, I had to do some serious tweaking.

The server will return HAL/JSON payload which looks something like this:

    {products: [{product: {attributes}},{...}]

which before being passed through to the `RESTAdapter` needs to be converted
into this:

    {products: [{attributes},{...}]

This is achieved by extending the product serializer and redefining
the `normalizePayload` hook like this:

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

## References

Here is a list of important references which I found very useful.

* [Ember Data HAL Adapter](https://github.com/locks/ember-data-hal-adapter)
* [HyperResource](https://github.com/gamache/hyperresource).
* [(Better) Authentication in ember.js](http://log.simplabs.com/post/57702291669/better-authentication-in-ember-js)
* [Emberjs Authentication the right way](http://webcloud.info/blog/2014/04/07/emberjs-authentication-the-right-way-javascript-version/) ([example](https://github.com/WebCloud/EmberJS-Auth-Example))

## Author

Feel free to contact me at Kiffin Gish <kiffin.gish@planet.nl>
