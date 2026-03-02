const filesUtils = require("../utils/files");

const messages_batch = new Map();
const MESSAGES_BATCH_SIZE = 100;


function addToMessage(message) {
    if (!message || !message.message_id|| !message.user_id) return;
    if (messages_batch.has(message.id)) return;

    messages_batch.set(message.message_id, {
        message_id: message.message_id,
        user_id: message.user_id,
        guild_id: message.guild_id,
        channel_id: message.channel_id,
        sent_at: new Date(message.sent_at).toISOString(),
        content: message.content
    });


    if (messages_batch.size >= MESSAGES_BATCH_SIZE) {
        const batchToWrite = Array.from(messages_batch.values());
        messages_batch.clear();
        const fileName = `messages_${Date.now()}.json`;
        filesUtils.writeFile("../scrapped_data/messages", fileName, batchToWrite)
            .then(() => console.log(`[BATCH] ${fileName} écrit !`))
            .catch(err => console.error(err));
    }
}


function flushChannels(client) {
    const channels_batch = [];

    client.guilds.cache.forEach(guild => {
        guild.channels.cache.forEach(channel => {
            channels_batch.push({
                channel_id: channel.id,
                guild_id: guild.id,
                name: channel.name,
                type: channel.type
            });
        });
    });

    const fileName = `channels_${Date.now()}.json`;
    filesUtils.writeFile("../scrapped_data/channels", fileName, channels_batch)
        .then(() => console.log(`[FLUSH] ${fileName} écrit !`))
        .catch(err => console.error(err));
}

function flushGuilds(client) {
    const guilds_batch = [];

    client.guilds.cache.forEach(guild => {
        guilds_batch.push({
            guild_id: guild.id,
            name: guild.name,
            icon_url: guild.iconURL(),
            owner_id: guild.ownerId,
            member_count: guild.memberCount
        });
    });

    const fileName = `guilds_${Date.now()}.json`;
    filesUtils.writeFile("../scrapped_data/guilds", fileName, guilds_batch)
        .then(() => console.log(`[FLUSH] ${fileName} écrit !`))
        .catch(err => console.error(err));
}


function addToGuild(guild) {
    if (!guild || !guild.id) return;

    const guildData = {
        guild_id: guild.id,
        name: guild.name,
        icon_url: guild.iconURL(),
        owner_id: guild.ownerId,
        member_count: guild.memberCount
    };

    const fileName = `guild_${Date.now()}.json`;
    filesUtils.writeFile("../scrapped_data/guilds", fileName, [guildData])
        .then(() => console.log(`[GUILD] ${fileName} écrit !`))
        .catch(err => console.error(err));
}

function addToChannel(channel) {
    if (!channel || !channel.id || !channel.guild) return;

    const channelData = {
        channel_id: channel.id,
        guild_id: channel.guild.id,
        name: channel.name,
        type: channel.type
    };

    const fileName = `channel_${Date.now()}.json`; 
    filesUtils.writeFile("../scrapped_data/channels", fileName, [channelData])
        .then(() => console.log(`[CHANNEL] ${fileName} écrit !`))
        .catch(err => console.error(err));
}


module.exports = {
    addToMessage,
    flushChannels,
    flushGuilds,
    addToChannel,
    addToGuild
};