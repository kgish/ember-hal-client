import { module, click } from 'ember-qunit';
import { makePlural } from 'hal-client/helpers/make-plural';

module('MakePluralHelper');

test('three horse should end with s', function() {
    ok(makePlural(3, { hash: { single: 'horse' } }) === 'horses');
});

test('one horse should just be horse', function() {
    ok(makePlural(1, { hash: { single: 'horse' } }) === 'horse');
});

test('five things should be thingies', function() {
    ok(makePlural(5, { hash: { single: 'thing', plural: 'thingies' } }) === 'thingies');
});
