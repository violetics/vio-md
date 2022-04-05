module.exports = {
	name: "checkkey",
	alias: ["cekkey", "cekapi", "cekapikey"],
	params: ["apikey"],
	description: "Mengecek status APIKEY kamu di https://violetics.pw/",
	wait: true,
	async exec(conn, msg) {
		const apikey = msg.args[0];
		try {
			const response = await conn
				.request("/api/utility/check-apikey", {
					params: { apikey: apikey },
				})
				.send();
			return msg.reply(JSON.stringify(response.data, null, 4));
		} catch (error) {
			if (error.response) {
				if (error.response.hasOwnProperty("data")) {
					return msg.reply(JSON.stringify(error.response.data, null, 4));
				} else msg.reply(error.message);
			} else msg.reply(error.message);
		}
	},
};
