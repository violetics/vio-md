const { getBinaryNodeChild } = require("@adiwajshing/baileys");
const { serialize } = require("./lib/serialize");
const { color, getAdmin, isUrl } = require("./lib");
const cooldown = new Map();
const prefix = "#";
const multi_pref = new RegExp("^[" + "!#$%&?/;:,.<>~-+=".replace(/[|\\{}()[\]^$+*?.\-\^]/g, "\\$&") + "]");
const config = require("./config.json");
const owner = config.owner;
function printSpam(isGc, sender, groupName) {
	if (isGc) {
		return console.log(color("[SPAM]", "red"), color(sender.split("@")[0], "lime"), "in", color(groupName, "lime"));
	}
	if (!isGc) {
		return console.log(color("[SPAM]", "red"), color(sender.split("@")[0], "lime"));
	}
}

function printLog(isCmd, sender, groupName, isGc) {
	if (isCmd && isGc) {
		return console.log(color("[EXEC]", "aqua"), color(sender, "lime"), "in", color(groupName, "lime"));
	}
	if (isCmd && !isGc) {
		return console.log(color("[EXEC]", "aqua"), color(sender, "lime"));
	}
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
		const isPrivate = msg.from.endsWith("@s.whatsapp.net");
		const botAdmin = isGroup ? (await getAdmin(conn, msg)).includes(conn.decodeJid(conn.user.id)) : false;
		const isOwner = owner.includes(sender);

		let temp_pref = multi_pref.test(body) ? body.split("").shift() : "#";
		body = body ? (body.startsWith(temp_pref) ? body : "") : "";

		const arg = body.substring(body.indexOf(" ") + 1);
		const args = body.trim().split(/ +/).slice(1);
		const comand = body.trim().split(/ +/)[0];
		const q = args.join(" ");
		const isCmd = body.startsWith(temp_pref);

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

		// Log
		printLog(isCmd, sender, groupName, isGroup);

		const cmdName = body.slice(temp_pref.length).trim().split(/ +/).shift().toLowerCase();
		const cmd = commands.get(cmdName) || [...commands.values()].find((x) => x.alias.find((x) => x.toLowerCase() == cmdName));
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
		const options = cmd.options;
		if (options.isSpam) {
			timestamps.set(from, now);
		}
		if (options.isAdmin && !isAdmin) {
			await msg.reply(response.GroupAdmin);
			return true;
		}
		if (options.isQuoted && !msg.quoted) {
			await msg.reply(`Silahkan reply pesan`);
			return true;
		}
		if (options.isQVideo && !isQVideo) {
			await msg.reply(`Silahkan reply video`);
			return true;
		}
		if (options.isQAudio && !isQAudio) {
			await msg.reply(`Silahkan reply audio`);
			return true;
		}
		if (options.isQSticker && !isQSticker) {
			await msg.reply(`Silahkan reply sticker`);
			return true;
		}
		if (options.isQImage && !isQImage) {
			await msg.reply(`Silahkan reply foto`);
			return true;
		}
		if (options.isQDocument && !isQDocument) {
			await msg.reply(`Silahkan reply document`);
			return true;
		}
		if (options.isOwner && !isOwner) {
			await msg.reply(response.OnlyOwner);
			return true;
		}
		if (options.isGroup && !isGroup) {
			await msg.reply(response.OnlyGrup);
			return true;
		}
		if (options.isBotAdmin && !botAdmin) {
			await msg.reply(response.BotAdmin);
			return true;
		}
		if (options.query && !q) {
			await msg.reply(options.query == "true" ? `Masukan query` : options.query);
			return true;
		}
		if (options.isPrivate && !isPrivate) {
			await msg.reply(response.OnlyPM);
			return true;
		}
		if (options.isUrl && !isUrl(q ? q : "p")) {
			await msg.reply(response.error.Iv);
			return true;
		}
		if (options.wait) {
			await msg.reply(typeof options.wait == "string" ? options.wait : response.wait);
		}
		try {
			await cmd.run({ conn: conn, commands: commands, config: config, command: cmd }, { m: msg, body: q, args: args });
		} catch (error) {
			await msg.reply(error);
		}
	} catch (error) {
		console.log(color("Error", "red"), error.stack);
	}
};
