module.exports = function (conn, msg, RESPONSE_DATA = {}) {
	const { options, key, text } = RESPONSE_DATA;
	const RESPONSE_TYPE = typeof options[key];
	let responseMessage;
	switch (RESPONSE_TYPE) {
		case "function":
			responseMessage = options[key](conn, msg);
			break;
		case "string":
			responseMessage = options[key];
			break;
		default:
			responseMessage = conn.config[key] ? conn.config[key] : text;
			break;
	}
	return responseMessage.trim();
};
