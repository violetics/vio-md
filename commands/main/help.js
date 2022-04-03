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
				const results = [];
				const _cmds = [...commands.keys()].concat(...[...commands.values()].map((x) => [x.category, ...x.alias])).filter(Boolean);
				_cmds
					.filter((_cmds) => _cmds.toLowerCase().includes(text.toLowerCase().trim()))
					.forEach((_cmd) => {
						const cmd = Array.from(commands.values()).find((x) => {
							let filter = [x.name, x.category, ...x.alias].filter(Boolean);
							if (filter.includes(_cmd)) return x;
						});
						if (!cmd) return results;
						results.push(commands.get(cmd.name));
					});
				if (!results.length) {
					return msg.reply(`'${text}' does not matched any command`);
				}
				let response = `❲ Similar Commands ❳\n\n`;
				response += `╭─▣\n`;
				for (var result of results.sort((a, b) => a.category.localeCompare(b.category))) {
					if (config.ignore.category.includes(result.category)) continue;
					response += `├ ${result.name} ${result.params.join(" ")}\n`;
				}
				response += `╰─▣\n\n`;
				response += `©${new Date().getFullYear()} ${config.name}`;
				return msg.reply(response.trim());
			}
			if (config.ignore.category.includes(cmd.category)) {
				return msg.reply(`'${text}' does not matched any command`);
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
			return await msg.reply(response.trim());
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
					title: `▣ ${ctg.name} ${ctg.params.join(" ")}`,
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
