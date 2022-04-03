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
	let obj = Object.entries(json);
	if (Array.isArray(json)) {
		let tmps = [];
		for (var data of json) {
			let tmp = parseEntries(Object.entries(data), ignoreVal, ignoreKey);
			const values = parseTmp(tmp, headers, body);
			tmps.push(values.trim());
		}
		let text = [headers.replace(/{title}/g, title), tmps.join("\n╰─▣\n\n╭─▣\n").trim(), footer];
		return text.join("\n").trim();
	}
	const tmp = parseEntries(obj, ignoreVal, ignoreKey);
	if (unicode) {
		const values = parseTmp(tmp, headers , body);
		let text = [headers.replace(/{title}/g, title), values.trim(), footer];
		return text.join("\n").trim();
	}
	return tmp;
}

const data = {
	status: 200,
	result: [
		{
			title: "Boruto: Naruto Next Generations",
			url: "https://194.163.183.129/anime/boruto-naruto-next-generations/",
			thumbnail: "https://i0.wp.com/194.163.183.129/wp-content/uploads/2021/12/poster-boruto.jpg?quality=90&resize=150,210",
			rate: "5.87",
			type: "TV",
			status: "Ongoing",
			views: "235362 Dilihat",
			genres: ["Action", "Adventure", "Martial Arts", "pilihan", "Shounen", "Super Power"],
			description: "Sinopsis anime Boruto: Naruto Next Generations : Setelah suksesnya Perang Dunia Shinobi Keempat, Konohagakure telah menikmati masa damai, kemakmuran,...",
		},
		{
			title: "Naruto: Shippuuden",
			url: "https://194.163.183.129/anime/naruto-shippuden/",
			thumbnail: "https://i0.wp.com/194.163.183.129/wp-content/uploads/2020/05/17407.jpg?quality=90&resize=150,210",
			rate: "8.15",
			type: "TV",
			status: "Completed",
			views: "94467 Dilihat",
			genres: ["Action", "Adventure", "Comedy", "Martial Arts", "Shounen", "Super Power"],
			description: "It has been two and a half years since Naruto Uzumaki left Konohagakure, the Hidden Leaf Village, for intense...",
		},
	],
};

module.exports = parseResult;
