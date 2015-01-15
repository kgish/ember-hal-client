import DS from 'ember-data';

export default DS.RESTSerializer.extend({
  typeForRoot: function(root) {
    var res = this._super(root);
    console.log('ApplicationSerializer: typeForRoot(root='+root+') => '+res);
    return res;
  },
  normalizePayload: function(payload) {
    console.log('ApplicationSerializer: normalizePayload(payload='+JSON.stringify(payload)+')');
    var normalizedPayload = {};
    if (payload['_links']) {
      var links = payload['_links'],
        href = links['self']['href'],
        m = href.match(/^\/([^\/]+)s(\/(.*))?$/);
      /*
       The value of href is either '/{name}s' or '/{name}s/id'
       If href = '/products' then m[1,2,3] = 'product', undefined, undefined
       If href = '/products/22' then m[1,2,3] = 'product', '/22', '22'
       Therefore if m[3] is undefined then payload is a 'collection' otherwise
       it's a resource with a given id = m[3]

       For this demo application, resource = 'product' or 'user' but this generic
       serializer should handle any other resource from the HAL/JSON.
       */
      var idn = m[3] || 'none';
      console.log('ApplicationSerializer: normalizePayload() => href='+href+',resource='+m[1]+',id='+idn);
      if (m[3]) {
        normalizedPayload = this._normalizeResource(payload, m[1], m[3]);
      } else {
        normalizedPayload = this._normalizeCollection(payload, m[1], 'ht');
      }
      console.log('ApplicationSerializer: normalizePayload() => '+JSON.stringify(normalizedPayload));
    } else {
      console.log('ApplicationSerializer: normalizePayload() => unknown payload format!');
    }
    return normalizedPayload;
  },

  /* private */

  _normalizeResource: function(payload, resource, id) {
    var normalizedPayload = {};
    normalizedPayload[resource] = {};
    normalizedPayload[resource]['id'] = id;
    for (var key in payload) {
      if (key === '_links' || key === '_embedded') { continue; }
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
      var id = resource.href.replace(/^\/[^\/]+\//, '');
      var next = {};
      next['id'] = id;
      for (var key in resource) {
        if (key === 'href') { continue; }
        next[key] = resource[key];
      }
      list.push(next);
    });
    normalizedPayload[resource+'s'] = list;
    return normalizedPayload;
  }
});
