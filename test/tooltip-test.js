var tape = require('tape'),
    tooltip = require('../');

tape('tooltip is an object.', function(test) {
  test.equal(typeof tooltip.tooltip, 'object');
  test.end();
});
