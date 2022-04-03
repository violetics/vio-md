const cp = require("child_process");

module.exports = {
	aliases: ["bash"],
	params: ["args"],
	wait: true,
	isOwner: true,
	isSelf: true,
	exec: function exec(conn, msg) {
		const execSync = cp.execSync(msg.text);
		return conn.reply(execSync.toString("utf-8"));
	},
};
