const { fetchLatestBaileysVersion, default: Baileys, useSingleFileAuthState, DisconnectReason } = require("@adiwajshing/baileys");
const log = require("pino");
const attribute = new Map();
const fs = require("fs");
const path = require("path");
const { Boom } = require("@hapi/boom");
const { color } = require("./lib");
const { prefix, session } = require("./config.json");
const handler = require("./handler");
const utils = require("./utils");

const { state, saveState } = useSingleFileAuthState(path.join(__dirname, `./${session}`), log({ level: "silent" }));
attribute.prefix = prefix;

const ReadFitur = () => {
	let pathdir = path.join(__dirname, "./command");
	let fitur = fs.readdirSync(pathdir);
	fitur.forEach(async (res) => {
		const commands = fs.readdirSync(`${pathdir}/${res}`).filter((file) => file.endsWith(".js"));
		for (let file of commands) {
			let command = require(`${pathdir}/${res}/${file}`);
			if (typeof command.run != "function") continue;
			const cmdOptions = {
				name: "command",
				alias: [""],
				desc: "",
				use: "",
				category: typeof command.category == "undefined" ? "" : res.toLowerCase(),
				wait: false,
				isOwner: false,
				isAdmin: false,
				isQuoted: false,
				isQVideo: false,
				isQAudio: false,
				isQImage: false,
				isQSticker: false,
				isQDocument: false,
				isGroup: false,
				isBotAdmin: false,
				query: false,
				isPrivate: false,
				isUrl: false,
				run: () => {},
			};
			if (command.options && typeof command == "object") command = { ...command, ...command.options };
			let cmd = utils.parseOptions(cmdOptions, command);
			let options = {};
			for (var k in cmd) typeof cmd[k] == "boolean" ? (options[k] = cmd[k]) : k == "query" ? (options[k] = cmd[k]) : "";
			let cmdObject = {
				name: cmd.name,
				alias: cmd.alias,
				desc: cmd.desc,
				use: cmd.use,
				category: cmd.category,
				options: options,
				run: cmd.run,
			};
			attribute.set(cmd.name, cmdObject);
		}
	});
	console.log(color("[INFO]", "yellow"), "command loaded!");
};
// cmd
ReadFitur();

const connect = async () => {
	let { version, isLatest } = await fetchLatestBaileysVersion();
	console.log(`Using: ${version}, newer: ${isLatest}`);
	const conn = Baileys({
		printQRInTerminal: true,
		auth: state,
		logger: log({ level: "silent" }),
		version,
	});

	conn.ev.on("creds.update", saveState);
	conn.ev.on("connection.update", async (up) => {
		const { lastDisconnect, connection } = up;
		if (connection) {
			console.log("Connection Status: ", connection);
		}

		if (connection === "close") {
			let reason = new Boom(lastDisconnect.error).output.statusCode;
			if (reason === DisconnectReason.badSession) {
				console.log(`Bad Session File, Please Delete ${session} and Scan Again`);
				conn.logout();
			} else if (reason === DisconnectReason.connectionClosed) {
				console.log("Connection closed, reconnecting....");
				connect();
			} else if (reason === DisconnectReason.connectionLost) {
				console.log("Connection Lost from Server, reconnecting...");
				connect();
			} else if (reason === DisconnectReason.connectionReplaced) {
				console.log("Connection Replaced, Another New Session Opened, Please Close Current Session First");
				conn.logout();
			} else if (reason === DisconnectReason.loggedOut) {
				console.log(`Device Logged Out, Please Delete ${session} and Scan Again.`);
				conn.logout();
			} else if (reason === DisconnectReason.restartRequired) {
				console.log("Restart Required, Restarting...");
				connect();
			} else if (reason === DisconnectReason.timedOut) {
				console.log("Connection TimedOut, Reconnecting...");
				connect();
			} else {
				conn.end(`Unknown DisconnectReason: ${reason}|${lastDisconnect.error}`);
			}
		}
	});
	// messages.upsert
	conn.ev.on("messages.upsert", async (m) => {
		handler(m, conn, attribute);
	});
};
connect();
