const util = require("util");
const config = require("../config");

function parseResult(json, options = {}) {
	if (!json) return json;
	let opts = {
		unicode: true,
		ignoreVal: [null, undefined, ""],
		ignoreKey: [],
		title: config.name,
		headers: `❲ {title} ❳\n\n╭─▣`,
		body: `├ {key}: {value}`,
		footer: `╰─▣\n\n©${new Date().getFullYear()} ${config.name}`,
		...options,
	};
	let { unicode, ignoreKey, title, headers, ignoreVal, body, footer } = opts;
	let tmp = [];
	let obj = Object.entries(json);
	for (let [_key, val] of obj) {
		if (ignoreVal.indexOf(val) != -1) continue;
		let key = _key[0].toUpperCase() + _key.slice(1);
		let type = typeof val;
		if (ignoreKey && ignoreKey.includes(_key)) continue;
		switch (type) {
			case "boolean":
				tmp.push([key, val ? "True" : "False"]);
				break;
			case "object":
				if (Array.isArray(val)) {
					tmp.push([key, val.join(", ")]);
				} else {
					tmp.push([
						key,
						parseResult(val, {
							ignoreKey,
							unicode: false,
						}),
					]);
				}
				break;
			default:
				tmp.push([key, val]);
				break;
		}
	}
	if (unicode) {
		const bodies = [];
		let values = "";
		for (var [_key, _val] of tmp) {
			switch (typeof _val) {
				case "object":
					values += "\n" + body.replace(/{key}/g, _key).replace(/{value}/g, "");
					if (Array.isArray(_val)) {
						for (var [key_, val_] of _val) {
							values += "\n" + body.replace(/{key}/g, key_).replace(/{value}/g, val_);
						}
					}
					break;
				default:
					values += "\n" + body.replace(/{key}/g, _key).replace(/{value}/g, _val);
					break;
			}
		}
		let text = [headers.replace(/{title}/g, title), values.trim(), footer];
		return text.join("\n").trim();
	}
	return tmp;
}

module.exports = parseResult;
