const cp = require("child_process");

module.exports = {
	aliases: ["bash"],
	params: ["args"],
	wait: true,
	isOwner: true,
	isSelf: true,
	exec: function exec(conn, msg) {
		cp.exec(msg.text, (error, stdout) => {
		    if (error) return msg.reply(error);
		    return msg.reply(stdout.toString());
		});
	},
};
