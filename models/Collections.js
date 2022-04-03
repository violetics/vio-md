class Collections extends Map {
	constructor(...args) {
		super(...args);
		this.methods = Object.getOwnPropertyNames(Collections.prototype);
	}
	setOptions(name, options = {}) {
		if (!name) return name;
		if (!Object.keys(options).length) return options;
		if (!this.has(name)) return `'${name}' is not matched any commands`;
		let command = this.get(name);
		this.set(name, {
			...command,
			options: {
				...command.options,
				...options,
			},
		});
		return this.get(name);
	}
}

module.exports = Collections;
