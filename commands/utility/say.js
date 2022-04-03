module.exports = {
	name: "say",
	params: ["text"],
	exec: (conn, msg) => {
		return msg.reply(msg.text);
	},
};
