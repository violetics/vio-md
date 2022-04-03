const util = require("util");
const chalk = require("chalk");

module.exports = {
	color(text, color) {
		return !color ? chalk.green(util.format(text)) : color.toLowerCase().includes("bright") ? chalk[color](util.format(text)) : chalk.keyword(color)(util.format(text));
	},
	async getAdmin(conn, msg) {
		let { participants } = await conn.groupMetadata(msg.from);
		return participants.filter((i) => !!i.admin);
	},
};
