module.exports = Array.prototype.shuffle = function () {
	const MF = (arr) => arr[~~Math.floor(Math.random() * arr.length)];
	if (arguments[0] && Array.isArray(arguments[0])) {
		return MF(arguments[0]);
	} else {
		return MF(this);
	}
};
