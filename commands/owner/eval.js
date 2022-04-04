module.exports = {
	name: "eval",
	alias: ["ev"],
	desc: "running javascript code via command can also test something code",
	params: ["code"],
	options: {
		isOwner: true,
		isSelf: true,
		isSpam: false,
	},
	async exec(conn, msg) {
		let evaluate;
		const { text } = msg;
		try {
			if (text.endsWith("--sync")) {
				evaluate = await eval(`(async () => { ${text.trim().replace("--sync", "")} })()`);
				return msg.reply(evaluate);
			}
			evaluate = await eval(text.trim());
			return msg.reply(evaluate);
		} catch (error) {
			return msg.reply(error);
		}
	},
};
