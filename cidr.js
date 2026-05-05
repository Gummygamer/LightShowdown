/**
 * CIDR checker
 * Pokemon Showdown - http://pokemonshowdown.com/
 *
 * This file controls support for checking to see if an IP matches a
 * CIDR range.
 *
 * @license MIT license
 */

var ipToLong = exports.ipToLong = function (ip) {
	if (typeof ip !== 'string') {
		throw new RangeError('Invalid IPv4 address: ' + ip);
	}
	var numIp = 0;
	var parts = ip.split('.');
	if (parts.length !== 4) {
		throw new RangeError('Invalid IPv4 address: ' + ip);
	}
	for (var i = 0; i < 4; i++) {
		if (!/^\d+$/.test(parts[i])) {
			throw new RangeError('Invalid IPv4 address: ' + ip);
		}
		var part = Number(parts[i]);
		if (part < 0 || part > 255 || part % 1 !== 0) {
			throw new RangeError('Invalid IPv4 address: ' + ip);
		}
		numIp *= 256;
		numIp += part;
	}
	return numIp;
};

var getPattern = exports.getPattern = function (cidr) {
	if (!cidr) return null;
	var index = cidr.indexOf('/');
	if (index > 0) {
		var subnet = ipToLong(cidr.substr(0, index));
		var bitString = cidr.substr(index + 1);
		if (!/^\d+$/.test(bitString)) {
			throw new RangeError('Invalid CIDR range: ' + cidr);
		}
		var bits = Number(bitString);
		if (bits < 0 || bits > 32 || bits % 1 !== 0) {
			throw new RangeError('Invalid CIDR range: ' + cidr);
		}
		var mask = bits ? -1 << (32 - bits) : 0;
		return [subnet & mask, mask];
	}
	return [ipToLong(cidr) | 0, -1];
};

/**
 * Returns a checker function for the passed CIDR range or array of
 * ranges. The checker function returns boolean whether or not its
 * passed IP is in the range.
 */
var checker = exports.checker = function (cidr) {
	if (!cidr || !cidr.length) {
		return function () {
			return false;
		};
	}

	var patterns;
	if (Array.isArray(cidr)) {
		patterns = cidr.map(getPattern).filter(function (x) {
			return x;
		});
	} else {
		patterns = [getPattern(cidr)];
	}

	return function (ip) {
		var longip = ipToLong(ip);
		for (var i = 0; i < patterns.length; ++i) {
			var pattern = patterns[i];
			if ((longip & pattern[1]) === pattern[0]) {
				return true;
			}
		}
		return false;
	};
};

var check = exports.check = function (cidr, ip) {
	return checker(cidr)(ip);
};
