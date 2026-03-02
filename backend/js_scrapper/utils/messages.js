function normalizeMessage(message) {
    const attachmentUrls = [];
    for (const attachment of message.attachments.values()) {
        if (attachment && attachment.url) {
            attachmentUrls.push(attachment.url);
        }
    }

    const embedUrls = [];
    for (const embed of message.embeds) {
        if (embed.image && embed.image.url) {
            embedUrls.push(embed.image.url);
        }

        if (embed.thumbnail && embed.thumbnail.url) {
            embedUrls.push(embed.thumbnail.url);
        }

        if (embed.video && embed.video.url) {
            embedUrls.push(embed.video.url);
        }

        if (embed.provider && embed.provider.url) {
            embedUrls.push(embed.provider.url);
        }
    }

    const stickerUrls = [];
    if (message.stickers) {
        for (const sticker of message.stickers) {
            if (sticker && sticker.url) {
                stickerUrls.push(sticker.url);
            }
        }
    }

    const allMediaArray = [];
    for (const url of [...attachmentUrls, ...embedUrls, ...stickerUrls]) {
        if (url) {
            allMediaArray.push(url);
        }
    }

    const allMedia = allMediaArray.join("\n");

    let guildId = null;
    if (message.guild) {
        guildId = message.guild.id;
    }

    const contentParts = [];
    if (message.content) {
        contentParts.push(message.content);
    }
    if (allMedia) {
        contentParts.push(allMedia);
    }

    return {
        message_id: message.id,
        user_id: message.author.id,
        guild_id: guildId,
        channel_id: message.channel.id,
        content: contentParts.join("\n"),
        sent_at: message.createdTimestamp
    };
}

module.exports = { normalizeMessage };