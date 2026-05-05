'use strict';

var assert = require('assert');
var Cidr = require('../cidr');

function assertThrowsRange(fn, message) {
	assert.throws(fn, function (err) {
		return err instanceof RangeError;
	}, message);
}

assert.strictEqual(Cidr.ipToLong('0.0.0.0'), 0);
assert.strictEqual(Cidr.ipToLong('127.0.0.1'), 2130706433);
assert.strictEqual(Cidr.ipToLong('255.255.255.255'), 4294967295);

assertThrowsRange(function () { Cidr.ipToLong('1.2.3'); }, 'short IPv4 addresses should be rejected');
assertThrowsRange(function () { Cidr.ipToLong('1.2.3.4.5'); }, 'long IPv4 addresses should be rejected');
assertThrowsRange(function () { Cidr.ipToLong('1.2.3.256'); }, 'octets >255 should be rejected');
assertThrowsRange(function () { Cidr.ipToLong('1.2.3.-1'); }, 'negative octets should be rejected');
assertThrowsRange(function () { Cidr.ipToLong('1.2.3.x'); }, 'non-numeric octets should be rejected');
assertThrowsRange(function () { Cidr.getPattern('192.168.0.0/33'); }, 'prefix >32 should be rejected');
assertThrowsRange(function () { Cidr.getPattern('192.168.0.0/-1'); }, 'negative prefix should be rejected');
assertThrowsRange(function () { Cidr.getPattern('192.168.0.0/x'); }, 'non-numeric prefix should be rejected');

assert.strictEqual(Cidr.check('192.168.0.0/16', '192.168.99.5'), true);
assert.strictEqual(Cidr.check('192.168.0.0/16', '192.169.0.1'), false);
assert.strictEqual(Cidr.check('10.0.0.1', '10.0.0.1'), true);
assert.strictEqual(Cidr.check('10.0.0.1', '10.0.0.2'), false);
assert.strictEqual(Cidr.check('255.255.255.255', '255.255.255.255'), true);
assert.strictEqual(Cidr.check('255.255.255.255', '255.255.255.254'), false);
assert.strictEqual(Cidr.check('0.0.0.0/0', '8.8.8.8'), true);
assert.strictEqual(Cidr.check('0.0.0.0/0', '255.255.255.255'), true);
assert.strictEqual(Cidr.check(['10.0.0.0/8', null, '', '192.168.1.1'], '192.168.1.1'), true);
assert.strictEqual(Cidr.check(null, '127.0.0.1'), false);

console.log('cidr tests passed');
