const util = require("util");
const chalk = require("chalk");
const Spinnies = require("spinnies");
const spinnies = new Spinnies({
	spinner: {
		interval: 85,
		frames: ["∙∙∙", "●∙∙", "∙●∙", "∙∙●", "∙∙∙"],
	},
});

const log = (module.exports = function log(text, color) {
	return !color ? chalk.greenBright(util.format(text)) : color.toLowerCase().includes("bright") ? chalk[color](util.format(text)) : chalk.keyword(color)(util.format(text));
});

log.error = function error(message) {
	return console.error(chalk.keyword("red")("[ERR]"), chalk.keyword("white")(util.format(message)));
};

log.info = function info(message) {
	if (typeof message == "object") {
		const entries = Object.entries(message);
		const colors = [];
		for (var [key, val] of entries) {
			colors.push(log(val, key));
		}
		return console.info(...colors);
	}
	return console.info(chalk.blueBright("[INFO]"), chalk.keyword("white")(util.format(message)));
};

log.sys = function sys(message) {
	return console.log(chalk.greenBright("[SYS]"), chalk.keyword("white")(util.format(message)));
};

log.animate = function animate(text, type) {
	if (type) {
		return spinnies[type]("animate", {
			succeedColor: "greenBright",
			text: util.format(text),
		});
	}
	if (!Object.keys(spinnies.spinners).includes("animate")) {
		return spinnies.add("animate", {
			color: "blue",
			text: util.format(text),
		});
	} else {
		return spinnies.update("animate", {
			color: "blue",
			text: util.format(text),
		});
	}
};
