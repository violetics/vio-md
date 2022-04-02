module.exports + {
    name: "say",
    exec: (conn, msg) => {
        return msg.reply(msg);
    },
};