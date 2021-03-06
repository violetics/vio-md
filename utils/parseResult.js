const util = require("util");
const config = require("../config");

function parseEntries(obj, ignoreVal, ignoreKey) {
	const tmp = [];
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
			case "function":
				tmp.push([key, util.format(val)]);
				break;
			default:
				tmp.push([key, val]);
				break;
		}
	}
	return tmp;
}

function parseTmp(tmp, headers, body) {
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
	return values;
}

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
	if (Array.isArray(json)) {
		let tmps = [];
		if (!!json.filter((el) => typeof el != "object").length) {
			tmps.push(body.replace(/{key}: /g, "").replace(/{value}/g, json.join("\n├ ")));
			let text = [headers.replace(/{title}/g, title), tmps.join("\n╰─▣\n\n╭─▣\n").trim(), footer];
			return unicode ? text.join("\n").trim() : tmps;
		}
		for (var data of json) {
			let tmp = parseEntries(Object.entries(data), ignoreVal, ignoreKey);
			const values = parseTmp(tmp, headers, body);
			tmps.push(values.trim());
		}
		let text = [headers.replace(/{title}/g, title), tmps.join("\n╰─▣\n\n╭─▣\n").trim(), footer];
		return unicode ? text.join("\n").trim() : tmps;
	}
	let obj = Object.entries(json);
	const tmp = parseEntries(obj, ignoreVal, ignoreKey);
	if (unicode) {
		const values = parseTmp(tmp, headers, body);
		let text = [headers.replace(/{title}/g, title), values.trim(), footer];
		return text.join("\n").trim();
	}
	return tmp;
}

module.exports = parseResult;
