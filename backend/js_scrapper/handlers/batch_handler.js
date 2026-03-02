const filesUtils = require("../utils/files");

const MESSAGES_BATCH = new Map();
const MESSAGES_BATCH_SIZE = 100;


function addToMessage(message) {
    if (!message || !message.message_id|| !message.user_id) return;
    if (MESSAGES_BATCH.has(message.id)) return;

    MESSAGES_BATCH.set(message.message_id, {
        message_id: message.message_id,
        user_id: message.user_id,
        guild_id: message.guild_id,
        channel_id: message.channel_id,
        sent_at: new Date(message.sent_at).toISOString(),
        content: message.content
    });


    if (MESSAGES_BATCH.size >= MESSAGES_BATCH_SIZE) {
        const batchToWrite = Array.from(MESSAGES_BATCH.values());
        MESSAGES_BATCH.clear();
        const fileName = `messages_${Date.now()}.json`;
        filesUtils.writeFile("../scrapped_data/messages", fileName, batchToWrite)
            .then(() => console.log(`[BATCH] ${fileName} écrit !`))
            .catch(err => console.error(err));
    }
}


function flushChannels(client) {
    const channelsBatch = [];

    client.guilds.cache.forEach(guild => {
        guild.channels.cache.forEach(channel => {
            channelsBatch.push({
                channel_id: channel.id,
                guild_id: guild.id,
                name: channel.name,
                type: channel.type
            });
        });
    });

    const fileName = `channels_${Date.now()}.json`;
    filesUtils.writeFile("../scrapped_data/channels", fileName, channelsBatch)
        .then(() => console.log(`[FLUSH] ${fileName} écrit !`))
        .catch(err => console.error(err));
};

function flushGuilds(client) {
    const guildsBatch = [];

    client.guilds.cache.forEach(guild => {
        guildsBatch.push({
            guild_id: guild.id,
            name: guild.name,
            icon_url: guild.iconURL(),
            owner_id: guild.ownerId,
            member_count: guild.memberCount
        });
    });

    const fileName = `guilds_${Date.now()}.json`;
    filesUtils.writeFile("../scrapped_data/guilds", fileName, guildsBatch)
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