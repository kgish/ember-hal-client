import { module, click } from 'ember-qunit';
import { fromNow } from 'hal-client/helpers/from-now';

module('FromNowHelper');

test('now should display a few seconds ago', function() {
    ok(fromNow(new Date() === 'a few seconds ago'));
});
