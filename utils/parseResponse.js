const { response } = require("../config");

module.exports = function (conn, msg, RESPONSE_DATA = {}) {
	const { options, key, text } = RESPONSE_DATA;
	const RESPONSE_TYPE = typeof options[key];
	console.log(options[key], RESPONSE_TYPE);
	switch (RESPONSE_TYPE) {
		case "function":
			{
				console.log(options[key] + "");
				return options[key](conn, msg);
			}
			break;
		case "string":
			{
				return msg.adReply(options[key]);
			}
			break;
		default:
			{
				const responseMessage = response[key] ? response[key] : text;
				return msg.adReply(responseMessage);
			}
			break;
	}
};
