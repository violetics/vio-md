module.exports = {
    description: "Used to searching anime/manga",
	params: ["manga"],
	wait: true,
	async exec(conn, msg) {
		let { text } = msg;
		const options = {
			params: { manga: text },
		};
		try {
			const response = await conn.request("/api/anime/manganato", options).send();
			const results = conn.parseResult(response.data.result, {
				title: "Manganato",
			});
			return msg.reply(results.trim());
		} catch (error) {
			if (error.response) {
				if (error.response.hasOwnProperty("data")) {
					return msg.reply(JSON.stringify(error.response.data, null, 4));
				} else msg.reply(error.message);
			} else msg.reply(error.message);
		}
	},
};
