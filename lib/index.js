const util = require("util");
const chalk = require("chalk");

module.exports = {
	color(text, color) {
		return !color ? chalk.green(util.format(text)) : chalk.keyword(color)(util.format(text));
	},
	async getAdmin(conn, msg) {
		const metadata = await conn.groupMetadata(msg.from);
		const participants = [];
		for (let i of metadata.participants) {
			participants.push(i.id);
		}
		return participants;
	},
	isUrl(url) {
		return url.match(new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)/, "gi"));
	},
	convert: require("./convert"),
};
