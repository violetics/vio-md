module.exports = async function getAdmin(conn, msg) {
	let { participants } = await conn.groupMetadata(msg.from);
	return participants.filter((i) => !!i.admin);
};
