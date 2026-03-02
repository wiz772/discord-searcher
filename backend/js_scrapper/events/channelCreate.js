const batch_handler = require("../handlers/batch_handler.js");

module.exports = async (client, channel) => {
    batch_handler.addToChannel(channel);
};