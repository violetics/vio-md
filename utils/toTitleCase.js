module.exports = String.prototype.toTitleCase = function (str) {
	return str ? str.toLowerCase().replace(/\b(\w)/g, (s) => s.toUpperCase()) : this.toLowerCase().replace(/\b(\w)/g, (s) => s.toUpperCase());
};
