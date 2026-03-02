const batch_handler = require("../handlers/batch_handler.js");

module.exports = async (client, guild) => {
    batch_handler.addToGuild(guild);
};