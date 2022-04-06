let { spawn } = require("child_process");
let { log } = require("./lib");
let path = require("path");
let fs = require("fs");
var isRunning = false;

/**
 * Start a js file
 * @param {String} file `path/to/file`
 */
function start(file) {
	if (isRunning) return;
	isRunning = true;
	let args = [path.join(__dirname, file), ...process.argv.slice(2)];
	let cp = spawn(process.argv[0], args, {
		stdio: ["inherit", "inherit", "inherit", "ipc"],
	});
	cp.on("message", (data) => {
		log.info({
			blueBright: "[REC]",
			greenBright: data,
		});
		switch (data) {
			case "reset":
				log.info({
					blueBright: "[SYS]",
					red: "Resetted System!",
				});
				cp.kill();
				isRunning = false;
				start.apply(this, arguments);
				break;
			case "uptime":
				cp.send(process.uptime());
				break;
		}
	});
	cp.on("exit", (code) => {
		isRunning = false;
		log.error("Exited with code " + code);
		if (code === 0) return;
		fs.watchFile(args[0], () => {
			fs.unwatchFile(args[0]);
			start(file);
		});
	});
}

start("./lib/connect.js");
