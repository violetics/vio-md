const fs = require("fs");

module.exports = {
	description: "Mengbisukan bot ke semua pesan kecuali Owner bot",
	isOwner: true,
	params: ["args"],
	async exec(conn, msg) {
		let { text } = msg;
		const setUp = ["true", "1", "on", "enable", "active", "aktif"];
		const endUp = ["false", "0", "off", "disable", "nonactive", "nonaktif"];
		if (setUp.includes(text.toLowerCase())) {
			conn.config.options.mute = true;
			await fs.writeFileSync("./config.json", JSON.stringify(conn.config, null, 4));
			await msg.adReply("Successfully muted bot, resetting...");
			return process.send("reset");
		} else if (endUp.includes(text.toLowerCase())) {
			conn.config.options.mute = false;
			await fs.writeFileSync("./config.json", JSON.stringify(conn.config, null, 4));
			await msg.adReply("Successfully unmuted bot, resetting...");
			return process.send("reset");
		}
	},
};
