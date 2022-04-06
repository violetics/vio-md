const { getBinaryNodeChild } = require("@adiwajshing/baileys");
const utils = require("../utils");
const config = require("../config.json");
const { serialize, log, getAdmin } = require(__dirname);
let { prefix, ownerNumber } = config;
const { isUrl, parseResponse } = utils;
const cooldown = new Map();

module.exports = async (m, conn, commands) => {
	try {
		if (m.type !== "notify") return;
		let msg = await serialize(JSON.parse(JSON.stringify(m.messages[0])), conn);
		if (!msg.message) return;

		//detect msg type senderKey and delete in order to be able to respond
		if (Object.keys(msg.message)[0] == "senderKeyDistributionMessage") delete msg.message.senderKeyDistributionMessage;
		if (Object.keys(msg.message)[0] == "messageContextInfo") delete msg.message.messageContextInfo;
		if (msg.key && msg.key.remoteJid === "status@broadcast") return;
		if (msg.type === "protocolMessage" || msg.type === "senderKeyDistributionMessage" || !msg.type || msg.type === "") return;

		let { body, type, isGroup, sender, from } = msg;
		const groupMetadata = isGroup ? await conn.groupMetadata(from) : "";
		const groupName = isGroup ? groupMetadata.subject : "";
		const isAdmin = isGroup ? groupMetadata.participants.filter((i) => !!i.admin).includes(sender) : false;
		const isPrivate = from.endsWith("@s.whatsapp.net");
		const isOwner = ownerNumber.concat(conn.decodeJid(conn.user.id)).includes(sender);

		if (config.options) {
			let options = config.options;
			if (options.autoRead) conn.sendReadReceipt(msg.from, msg.sender, [msg.id]);
			if (options.multiPrefix) prefix = /^[zZ#$+.?_&<>!/\\]/;
			if (options.noPrefix) prefix = "";
			if (options.mute && !isOwner) return;
		}

		let bodyPrefix = new RegExp(prefix, "gi").test(body) ? body : "";
		let args = bodyPrefix.split(/ +/).slice(1);
		let text = args.join(" ");

		let cmdName = bodyPrefix.split(/ +/).shift().replace(new RegExp(prefix, "gi"), "").trim().toLowerCase();
		if (!cmdName && msg.quoted) {
			cmdName = new RegExp(prefix, "gi").test(msg.quoted.id) ? msg.quoted.id.split(new RegExp(prefix, "gi"))[1].split("-")[0] : "";
			args = body.split(/ +/);
			text = args.join(" ");
		}
		const cmd = commands.get(cmdName) || Array.from(commands.values()).find((x) => x.alias.find((x) => x.toLowerCase() == cmdName));
		cmd
			? log.info({ redBright: "[CMD]", blueBright: sender, ...(isGroup ? { cyan: "in " + groupName } : {}), white: text })
			: log.info({ redBright: "[MSG]", blueBright: sender, ...(isGroup ? { cyan: "in " + groupName } : {}), white: body });
		if (!cmd) return;

		if (!cooldown.has(from)) {
			cooldown.set(from, new Map());
		}
		const now = Date.now();
		const timestamps = cooldown.get(from);
		const cdAmount = 5 * 1000;
		if (timestamps.has(from)) {
			const expiration = timestamps.get(from) + cdAmount;
			if (now < expiration) {
				let timeLeft = (expiration - now) / 1000;
				if (isGroup) {
					log.info({ red: "[SPAM]", blueBright: sender, cyan: "in " + groupName, white: text });
					return await msg.adReply(`This group is on cooldown, please wait another _${timeLeft.toFixed(1)} second(s)_`);
				} else if (!isGroup) {
					log.info({ red: "[SPAM]", blueBright: sender, white: text });
					return await msg.adReply(`You are on cooldown, please wait another _${timeLeft.toFixed(1)} second(s)_`);
				}
			}
		}
		setTimeout(() => timestamps.delete(from), cdAmount);
		const response = config.response;
		const options = cmd.options;
		if (!options.isSelf && msg.isSelf) {
			return;
		}
		if (options.isSpam && !isOwner) {
			timestamps.set(from, now);
		}
		if (options.isSelf && !msg.isSelf && !isOwner) {
			return parseResponse(conn, msg, { options: options, key: "isSelf", text: "Perintah ini khusus Owner & Bot!" });
		}
		if (options.isOwner && !isOwner) {
			return parseResponse(conn, msg, { options: options, key: "isOwner", text: "Perintah ini khusus Owner bot" });
		}
		if (options.isAdmin && !isAdmin) {
			return parseResponse(conn, msg, { options: options, key: "isAdmin", text: "Perintah ini khusus Admin group" });
		}
		if (options.isGroup && !isGroup) {
			return parseResponse(conn, msg, { options: options, key: "isGroup", text: "Perintah ini khusus untuk Group Message" });
		}
		if (options.isPrivate && !isPrivate) {
			return parseResponse(conn, msg, { options: options, key: "isPrivate", text: "Perintah ini khusus untuk Private Message" });
		}
		if (!!options.params.length && !text) {
			return await msg.adReply(`Masukkan parameter ${options.params.join(" ")}, atau reply pesan bot`, { messageId: `${config.prefix}${cmd.name}-${Date.now()}` });
		}
		if (options.isUrl && !isUrl(text)) {
			return parseResponse(conn, msg, { options: options, key: "isUrl", text: "Link yang kamu berikan tidak valid" });
		}
		if (options.wait) {
			await parseResponse(conn, msg, { options: options, key: "wait", text: "_Wait a minute, data is being processed!_" });
		}
		try {
			await cmd.exec(
				{ ...conn, ...utils, response: response, commands: commands, config: config, prefix: new RegExp(prefix, "gi"), command: cmd },
				{ ...msg, text: text.trim(), args: args, chats: m }
			);
		} catch (error) {
			log.error(error);
			await msg.reply(error);
		}
	} catch (error) {
		log.error(error);
	}
};
