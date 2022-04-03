function or() {
	for (let arg of arguments) {
		if (arg) return arg;
	}
	return arguments[arguments.length - 1];
}

module.exports = function parseOptions(defaultArgs = {}, args = {}) {
	let options = {};
	let entries = Object.entries(defaultArgs);
	for (let i = 0; i < Object.keys(defaultArgs).length; i++) {
		let [key, val] = entries[i];
		options[key] = or(args[key], val);
	}
	return options;
};
