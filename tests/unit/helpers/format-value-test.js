import {
  formatValue
} from 'hal-client/helpers/format-value';

module('FormatValueHelper');

// Replace this with your real tests.
test('empty string should display [EMPTY]', function() {
  ok(formatValue('') === '[EMPTY]');
});

test('null should display [NULL]', function() {
    ok(formatValue(null) === '[NULL]');
});

test('kiffin should display kiffin', function() {
    ok(formatValue('kiffin') === 'kiffin');
});

test('undefined should display [UNDEFINED]', function() {
    ok(formatValue(undefined) === '[UNDEFINED]');
});

test('placeholder oops! for null should display oops!', function() {
    ok(formatValue(null, { hash: { placeholder: 'oops!' } }) === 'oops!');
});
