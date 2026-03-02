const message_utils = require("../utils/messages.js");
const batch_handler = require("../handlers/batch_handler.js");

module.exports = async (client, message) => {
    if (message.author?.bot || !message.guild) return;

    const newMessage = message_utils.normalizeMessage(message);
    batch_handler.addToMessage(newMessage);
};