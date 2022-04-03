const axios = require("axios");
const cache = new Map();

class Request {
	constructor(path, options) {
		this.methods = Object.getOwnPropertyNames(Request.prototype);
		this.cache = cache;
		this.BASEURL = "https://violetics.pw";
		this.BASEURL_PATH = this.BASEURL.concat(path);
		this.method = (options.method || "get").toUpperCase();
		this.options = options;
	}
	send(options = {}) {
		let REQUEST_COUNT = 1;
		this.options = Object.assign(this.options, options);
		if (this.cache.has(this.BASEURL_PATH)) REQUEST_COUNT = REQUEST_COUNT + this.cache.get(this.BASEURL_PATH);
		this.cache.set(this.BASEURL_PATH, REQUEST_COUNT);
		this.cache.REQUEST_COUNT = REQUEST_COUNT;
		return axios({
			url: this.BASEURL_PATH,
			headers: {
				"X-Request-From": "Vio-MD",
				"X-Request-Count": REQUEST_COUNT,
				"User-Agent": "Mozilla/5.0 (Linux; Android 9; Redmi 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.77 Mobile Safari/537.36",
			},
			...this.options,
		});
	}
}

module.exports = (path, options = {}) => new Request(path, options);
