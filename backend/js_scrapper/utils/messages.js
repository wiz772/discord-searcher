function extractUrls(array, fields = []) {
    const urls = [];
    if (!array) return urls;

    for (const item of array) {
        if (!item) continue;

        for (const field of fields) {
            if (item[field] && item[field].url) {
                urls.push(item[field].url);
            }
        }
    }
    return urls;
}

function normalizeMessage(message) {
    const attachmentUrls = [...message.attachments.values()]
        .map(a => a?.url)
        .filter(Boolean);

    const embedUrls = extractUrls(message.embeds, ["image", "thumbnail", "video", "provider"]);
    const stickerUrls = (message.stickers || []).map(s => s?.url).filter(Boolean);

    const allMedia = [...attachmentUrls, ...embedUrls, ...stickerUrls].join("\n");

    const contentParts = [];
    if (message.content) contentParts.push(message.content);
    if (allMedia) contentParts.push(allMedia);

    return {
        message_id: message.id,
        user_id: message.author.id,
        guild_id: message.guild?.id ?? null,
        channel_id: message.channel.id,
        content: contentParts.join("\n"),
        sent_at: message.createdTimestamp,
    };
}

module.exports = { normalizeMessage };