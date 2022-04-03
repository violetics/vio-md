module.exports = {
	params: ["manga"],
	async exec(conn, msg) {
		let { text } = msg;
		const options = {
			params: { manga: text },
		};
		try {
			const response = await conn.request("/api/anime/manganato", options).send();
			var results = "";
			for (var data of response.data.result)
				results += conn.parseResult(data, {
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
