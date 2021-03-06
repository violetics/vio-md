module.exports = {
	aliases: ["menu"],
	options: {
		isSpam: false,
	},
	async exec({ sendMessage, commands, config }, msg) {
		const { serialize, Category, prefix } = commands;
		const { args, text } = msg;
		if (text) {
			let cmd = commands.get(args[0]) || Array.from(commands.values()).find((x) => x.alias.includes(args[0]));
			if (!cmd || (cmd && cmd.category == "private")) {
				const _cmds = Array.from(commands.values()).filter(Boolean);
				let results = _cmds.filter((_cmds) => [_cmds.name, ..._cmds.alias].find((x) => x.toLowerCase().includes(text.toLowerCase())));
				if (!results.length) results = _cmds.filter((_cmds) => _cmds.category.toLowerCase().includes(text.toLowerCase()));
				if (!results.length) return msg.adReply(`'${text}' does not matched any command`);
				const sorted = results.sort((a, b) => a.category.localeCompare(b.category));
				const filterCmds = [...new Map(sorted.map((item) => [item["name"], item])).values()];
				if (filterCmds.find((x) => config.ignore.category.includes(x.category))) return msg.adReply(`'${text}' does not matched any command`);
				let response = `❲ Similar Commands ❳\n\n`;
				response += `╭─▣\n`;
				for (var result of filterCmds) {
					if (config.ignore.category.includes(result.category)) continue;
					response += `├ ${result.name} ${result.params.join(" ")}\n`;
				}
				response += `╰─▣\n\n`;
				response += `©${new Date().getFullYear()} ${config.name}`;
				return msg.adReply(response.trim());
			}
			if (config.ignore.category.includes(cmd.category)) {
				return msg.adReply(`'${text}' does not matched any command`);
			}
			let response = "❲ Detail Command ❳\n\n";
			response += `╭─▣\n`;
			response += `├ Name: ${cmd.name}\n`;
			response += `├ Category: ${cmd.category.toTitleCase()}\n`;
			response += `├ Aliases: ${(!!cmd.alias.length && cmd.alias.join(", ")) || "None Aliases"}\n`;
			response += `├ Description: ${cmd.description ? cmd.description.trim() : "None Description"}\n`;
			response += `├ Usage: ${prefix}${cmd.name} ${cmd.params.join(" ")}\n`;
			response += `╰─▣\n\n`;
			response += "Note: [] = optional, | = or, <> = required, & = multiple queries";
			return await msg.adReply(response.trim());
		}
		const sections = [];
		const keys = [...Category.keys()];
		for (var categories of keys) {
			if (config.ignore.category.includes(categories)) continue;
			const category = Category.get(categories);
			const section = {
				title: categories.toTitleCase(),
				rows: [],
			};
			for (var ctg of category) {
				section.rows.push({
					title: `${prefix + ctg.name} ${ctg.params.join(" ")}`,
					rowId: prefix + ctg.name,
					description: ctg.description,
				});
			}
			sections.push(section);
		}
		const listMessage = {
			text: "Vio-MD is multi-device whatsapp bot using library @adiwajshing/baileys and example bot of Violetics API",
			footer: `©${new Date().getFullYear()} ${config.name}`,
			title: "Powered by Violetics API",
			buttonText: "❲ List Commands ❳",
			sections: sections,
		};
		return sendMessage(msg.from, listMessage, { quoted: msg });
	},
};
