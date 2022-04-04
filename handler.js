const { getBinaryNodeChild } = require("@adiwajshing/baileys");
const { serialize } = require("./lib/serialize");
const { color, getAdmin } = require("./lib");
const utils = require("./utils");
const { isUrl } = utils;
const cooldown = new Map();
const config = require("./config.json");
const owner = config.owner;

function printSpam(isGc, sender, groupName) {
	if (isGc) {
		return console.info(color("[SPAM]", "red"), color(sender.split("@")[0], "lime"), "in", color(groupName, "lime"));
	}
	if (!isGc) {
		return console.info(color("[SPAM]", "red"), color(sender.split("@")[0], "lime"));
	}
}

function printLog(sender, groupName, isGc, body, isCmd) {
	if (!isCmd) {
		if (isGc) return console.info(color("[MSG]"), color(sender, "lime"), "in", color(groupName, "lime"), color(body, "white"));
		if (!isGc) return console.info(color("[EXEC]"), color(sender, "lime"), color(body, "white"));
	}
	if (isGc) return console.info(color("[EXEC]"), color(sender, "lime"), "in", color(groupName, "lime"), color(body, "white"));
	if (!isGc) return console.info(color("[EXEC]"), color(sender, "lime"), color(body, "white"));
}

module.exports = handler = async (m, conn, commands) => {
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
		const isAdmin = isGroup ? (await getAdmin(conn, msg)).includes(sender) : false;
		const isPrivate = from.endsWith("@s.whatsapp.net");
		const botAdmin = isGroup ? (await getAdmin(conn, msg)).includes(conn.decodeJid(conn.user.id)) : false;
		const isOwner = owner.concat(conn.decodeJid(conn.user.id)).includes(sender);

		const bodyPrefix = body && body.startsWith(config.prefix) ? body : "";
		const args = bodyPrefix.trim().split(/ +/).slice(1);
		const text = args.join(" ");

		//type message
		const isVideo = type === "videoMessage";
		const isImage = type === "imageMessage";
		const isMedia = type === "imageMessage" || type === "videoMessage";
		const isLocation = type === "locationMessage";
		const contentQ = msg.quoted ? JSON.stringify(msg.quoted) : [];
		const isQAudio = type === "extendedTextMessage" && contentQ.includes("audioMessage");
		const isQVideo = type === "extendedTextMessage" && contentQ.includes("videoMessage");
		const isQImage = type === "extendedTextMessage" && contentQ.includes("imageMessage");
		const isQDocument = type === "extendedTextMessage" && contentQ.includes("documentMessage");
		const isQSticker = type === "extendedTextMessage" && contentQ.includes("stickerMessage");
		const isQLocation = type === "extendedTextMessage" && contentQ.includes("locationMessage");

		const cmdName = bodyPrefix.slice(config.prefix.length).trim().split(/ +/).shift().toLowerCase();
		const cmd = commands.get(cmdName) || [...commands.values()].find((x) => x.alias.find((x) => x.toLowerCase() == cmdName.toLowerCase()));
		cmd ? printLog(sender, groupName, isGroup, body, true) : printLog(sender, groupName, isGroup, bodyPrefix, false);
		if (!cmd) return;

		if (!cooldown.has(from)) {
			cooldown.set(from, new Map());
		}
		const now = Date.now();
		const timestamps = cooldown.get(from);
		const cdAmount = (cmd.cooldown || 5) * 1000;
		if (timestamps.has(from)) {
			const expiration = timestamps.get(from) + cdAmount;
			if (now < expiration) {
				if (isGroup) {
					let timeLeft = (expiration - now) / 1000;
					printSpam(isGroup, sender, groupName);
					return await msg.reply(`This group is on cooldown, please wait another _${timeLeft.toFixed(1)} second(s)_`);
				} else if (!isGroup) {
					let timeLeft = (expiration - now) / 1000;
					printSpam(isGroup, sender);
					return await msg.reply(`You are on cooldown, please wait another _${timeLeft.toFixed(1)} second(s)_`);
				}
			}
		}
		setTimeout(() => timestamps.delete(from), cdAmount);
		const response = config.response;
		const options = cmd.options;
		if (options.isSpam && !isOwner) {
			timestamps.set(from, now);
		}
		if (options.isSelf && !msg.isSelf && !isOwner) {
			return await msg.reply(response.self);
		}
		if (!options.isSelf && msg.isSelf) {
			return;
		}
		if (options.isOwner && !isOwner) {
			return await msg.reply(response.owner);
		}
		if (options.isAdmin && !isAdmin) {
			return await msg.reply(response.admin);
		}
		if (options.isQuoted && !msg.quoted) {
			return await msg.reply(`Silahkan reply pesan`);
		}
		if (options.isQVideo && !isQVideo) {
			return await msg.reply(`Silahkan reply video`);
		}
		if (options.isQAudio && !isQAudio) {
			return await msg.reply(`Silahkan reply audio`);
		}
		if (options.isQSticker && !isQSticker) {
			return await msg.reply(`Silahkan reply sticker`);
		}
		if (options.isQImage && !isQImage) {
			return await msg.reply(`Silahkan reply foto`);
		}
		if (options.isQDocument && !isQDocument) {
			return await msg.reply(`Silahkan reply document`);
		}
		if (options.isGroup && !isGroup) {
			return await msg.reply(response.group);
		}
		if (options.isBotAdmin && !botAdmin) {
			return await msg.reply(response.botAdmin);
		}
		if (options.params.length != args.length) {
			return await msg.reply(`Masukkan parameter ${options.params.join(" ")}`);
		}
		if (options.isPrivate && !isPrivate) {
			return await msg.reply(response.private);
		}
		if (options.isUrl && !isUrl(text)) {
			return await msg.reply(response.error.url);
		}
		if (options.wait) {
			await msg.reply(typeof options.wait == "string" ? options.wait : response.wait);
		}
		try {
			await cmd.exec({ ...conn, ...utils, response: response, commands: commands, config: config, command: cmd }, { ...msg, text: text.trim(), args: args });
		} catch (error) {
			await msg.reply(error);
		}
	} catch (error) {
		console.error(color("[ERR]", "red"), error.stack);
	}
};
