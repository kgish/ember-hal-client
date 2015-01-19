import {
  yesNo
} from 'hal-client/helpers/yes-no';

module('YesNoHelper');

test('true should display yes', function() {
    ok(yesNo(true) === 'yes');
});

test('false should display no', function() {
    ok(yesNo(false) === 'no');
});
