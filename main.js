const { fetchLatestBaileysVersion, default: Baileys, useSingleFileAuthState, DisconnectReason } = require("@adiwajshing/baileys");
const fs = require("fs");
const log = require("pino");
const path = require("path");
const utils = require("./utils");
const models = require("./models");
const handler = require("./handler");
const { color } = require("./lib");
const { Boom } = require("@hapi/boom");
const { prefix, session } = require("./config.json");
const { state, saveState } = useSingleFileAuthState(path.join(__dirname, `./${session}`), log({ level: "silent" }));
const Commands = new models.Collections();
Commands.prefix = prefix;

const readCommands = () => {
	let pathDir = path.join(__dirname, "/commands");
	let dirs = fs.readdirSync(pathDir);
	let Category = new models.Collections();
	try {
		for (var dir of dirs) {
			const stats = fs.statSync(`${pathDir}/${dir}`);
			if (!stats.isDirectory()) continue;
			const groups = dir.toLowerCase();
			Category.set(groups, []);
			const cmds = fs.readdirSync(`${pathDir}/${dir}`).filter((file) => file.endsWith(".js"));
			for (let file of cmds) {
				let path = `${pathDir}/${dir}/${file}`;
				let command = require(path);
				if (!command) continue;
				if (typeof command.exec != "function") continue;
				command.aliases ? (command.alias = command.aliases) : command.alias;
				command.desc ? (command.description = command.desc) : command.description;
				const cmdOptions = {
					name: file.split(".js")[0],
					alias: [""],
					description: "",
					params: [],
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
					isPrivate: false,
					isUrl: false,
					isSpam: true,
					isSelf: false,
					exec: () => {},
				};
				if (command.options && typeof command == "object") command = { ...command, ...command.options };
				let cmd = utils.parseOptions(cmdOptions, command);
				let options = {};
				for (var k in cmd) typeof cmd[k] == "boolean" ? (options[k] = cmd[k]) : ["query", "params"].includes(k) ? (options[k] = cmd[k]) : "";
				let cmdObject = {
					name: cmd.name,
					alias: cmd.alias,
					description: cmd.description,
					category: groups,
					params: Array.isArray(cmd.params) ? cmd.params.map((x) => "<" + x + ">") : [],
					options: options,
					exec: cmd.exec,
					path: path,
				};
				Category.get(groups).push(cmdObject);
				Commands.set(cmd.name, cmdObject);
				console.info(color("[SYS]", "blueBright"), `Load ${cmd.name} | /${dir}/${file}`);
			}
		}
	} catch (error) {
		console.error(color("[ERR]", "red"), error);
		process.exit(1);
	}
	Commands.Category = Category;
	const serialize = (Commands.constructor.prototype.serialize = Object.fromEntries(Commands.entries()));
	Commands.constructor.prototype.length = Commands.size;
	Commands.toJSON = function () {
		return serialize;
	};
	Commands.toString = function (replacer = 4) {
		return JSON.stringify(serialize, null, replacer);
	};
	console.info(color("[SYS]", "blueBright"), "Commands loaded!");
};
// cmd
readCommands();

const connect = async () => {
	let { version, isLatest } = await fetchLatestBaileysVersion();
	console.info(`Using: ${version}, newer: ${isLatest}`);
	const conn = Baileys({
		printQRInTerminal: true,
		auth: state,
		logger: log({ level: "silent" }),
		version: version,
	});

	conn.ev.on("creds.update", saveState);
	conn.ev.on("connection.update", async (up) => {
		const { lastDisconnect, connection } = up;
		if (connection) {
			console.info("Connection Status: ", connection);
		}

		if (connection === "close") {
			let reason = new Boom(lastDisconnect.error).output.statusCode;
			if (reason === DisconnectReason.badSession) {
				console.info(`Bad Session File, Please Delete ${session} and Scan Again`);
				conn.logout();
			} else if (reason === DisconnectReason.connectionClosed) {
				console.info("Connection closed, reconnecting....");
				connect();
			} else if (reason === DisconnectReason.connectionLost) {
				console.info("Connection Lost from Server, reconnecting...");
				connect();
			} else if (reason === DisconnectReason.connectionReplaced) {
				console.info("Connection Replaced, Another New Session Opened, Please Close Current Session First");
				conn.logout();
			} else if (reason === DisconnectReason.loggedOut) {
				console.info(`Device Logged Out, Please Delete ${session} and Scan Again.`);
				conn.logout();
			} else if (reason === DisconnectReason.restartRequired) {
				console.info("Restart Required, Restarting...");
				connect();
			} else if (reason === DisconnectReason.timedOut) {
				console.info("Connection TimedOut, Reconnecting...");
				connect();
			} else {
				conn.end(`Unknown DisconnectReason: ${reason}|${lastDisconnect.error}`);
			}
		}
	});
	// messages.upsert
	conn.ev.on("messages.upsert", async (m) => {
		handler(m, conn, Commands);
	});
};
connect();

process.on("uncaughtException", function (error) {
	console.error(color("[ERR]", "red"), error.stack);
});
