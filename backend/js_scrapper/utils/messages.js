function normalizeMessage(message) {
    const attachmentUrls = [...message.attachments.values()]
        .map(a => a.url);

    const embedUrls = message.embeds.flatMap(e => {
        const urls = [];
        if (e.image?.url) urls.push(e.image.url);
        if (e.thumbnail?.url) urls.push(e.thumbnail.url);
        if (e.video?.url) urls.push(e.video.url);
        if (e.provider?.url) urls.push(e.provider.url);
        return urls;
    });

    const stickerUrls = message.stickers?.map(s => s.url) ?? [];

    const allMedia = [...attachmentUrls, ...embedUrls, ...stickerUrls]
        .filter(Boolean)
        .join("\n");

    return {
        message_id: message.id,
        user_id: message.author.id,
        guild_id: message.guild?.id ?? null,
        channel_id: message.channel.id,
        content: [
            message.content,
            allMedia
        ].filter(Boolean).join("\n"),
        sent_at: message.createdTimestamp
    };
}

module.exports = {normalizeMessage};