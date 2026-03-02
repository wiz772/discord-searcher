const apiBase = "http://localhost:8000"; // API FastAPI

const btnGuilds = document.getElementById("btnGuilds");
const loading = document.getElementById("loading");

btnGuilds.addEventListener("click", () => {
    const userId = document.getElementById("userId").value.trim();
    if (!userId) return alert("Veuillez entrer un User ID");
    showLoading(true);
    clearResults();
    getGuilds(userId);
});

function clearResults() {
    const guildsList = document.getElementById("guildsList");
    guildsList.innerHTML = "";
    document.getElementById("results").classList.add("hidden");
    document.getElementById("userCard").classList.add("hidden");
    document.body.classList.remove('results-visible');
}

function showLoading(show) {
    loading.classList.toggle('hidden', !show);
    btnGuilds.disabled = show;
}

function handleError(error, context) {
    if (error instanceof TypeError) {
        alert(`Network error/CORS issue (${context}).`);
    } else {
        alert(error.message);
    }
    console.error(error);
}

async function fetchUserInfo(userId) {
    try {
        const res = await fetch(`${apiBase}/discord/user/${userId}`);
        if (!res.ok) throw new Error(`Erreur HTTP ${res.status}`);
        
        const user = await res.json();
        
        // Display user info
        const userName = document.getElementById("userName");
        const userDiscrim = document.getElementById("userDiscrim");
        const userId_elem = document.getElementById("userId");
        const userAvatar = document.getElementById("userAvatar");
        
        userName.textContent = user.username || "User";
        userDiscrim.textContent = user.discriminator ? `#${user.discriminator}` : "";
        userId_elem.textContent = userId;
        
        if (user.avatar) {
            const avatarUrl = `https://cdn.discordapp.com/avatars/${userId}/${user.avatar}.png`;
            userAvatar.innerHTML = `<img src="${avatarUrl}" alt="${user.username}">`;
        }
        
        document.getElementById("userCard").classList.remove("hidden");
    } catch (error) {
        // Si l'appel échoue, affiche juste l'ID
        document.getElementById("userName").textContent = "User";
        document.getElementById("userId").textContent = userId;
        document.getElementById("userCard").classList.remove("hidden");
        console.warn("Couldn't fetch Discord user info:", error);
    }
}

async function getGuilds(userId) {
    try {
        const res = await fetch(`${apiBase}/user/${userId}/guilds`);
        if (!res.ok) throw new Error(`Erreur HTTP ${res.status}`);
        const guilds = await res.json();

        const guildsList = document.getElementById("guildsList");
        guildsList.innerHTML = "";

        guilds.forEach(g => {
            const details = document.createElement("details");
            const summary = document.createElement("summary");
            summary.textContent = g.name;
            details.appendChild(summary);
            details.addEventListener("toggle", () => {
                if (details.open && !details.dataset.loaded) {
                    showLoading(true);
                    getChannels(userId, g.guild_id, details);
                }
            });
            guildsList.appendChild(details);
        });

        document.getElementById("results").classList.remove("hidden");
        document.body.classList.add('results-visible');
        
        // Fetch user info from Discord API
        await fetchUserInfo(userId);
    } catch (error) {
        handleError(error, "API guilds");
    } finally {
        showLoading(false);
    }
}

async function getChannels(userId, guildId, parentDetails) {
    try {
        const res = await fetch(`${apiBase}/user/${userId}/guild/${guildId}/channels`);
        if (!res.ok) throw new Error("Erreur lors de la récupération des channels");
        const channels = await res.json();

        const container = document.createElement("div");
        container.className = "channels";

        channels.forEach(c => {
            const details = document.createElement("details");
            const summary = document.createElement("summary");
            summary.textContent = c.name;
            details.appendChild(summary);
            details.addEventListener("toggle", () => {
                if (details.open && !details.dataset.loaded) {
                    showLoading(true);
                    getMessages(userId, c.channel_id, details);
                }
            });
            container.appendChild(details);
        });

        parentDetails.appendChild(container);
        parentDetails.dataset.loaded = true;
    } catch (error) {
        handleError(error, "API channels");
    } finally {
        showLoading(false);
    }
}

async function getMessages(userId, channelId, parentDetails) {
    try {
        const res = await fetch(`${apiBase}/user/${userId}/channel/${channelId}/messages?limit=200`);
        if (!res.ok) throw new Error("Erreur lors de la récupération des messages");
        const messages = await res.json();

        parentDetails._messages = messages; // store for pagination
        parentDetails._pageSize = 20;

        renderMessagePage(parentDetails, 0);
        parentDetails.dataset.loaded = true;
    } catch (error) {
        handleError(error, "API messages");
    } finally {
        showLoading(false);
    }
}

function renderMessagePage(parentDetails, page) {
    const messages = parentDetails._messages || [];
    const pageSize = parentDetails._pageSize || 20;
    const start = page * pageSize;

    // clear previous content
    let container = parentDetails.querySelector('.messages');
    if (!container) {
        container = document.createElement('div');
        container.className = 'messages';
        parentDetails.appendChild(container);
    }
    container.innerHTML = '';

    const pageMessages = messages.slice(start, start + pageSize);
    pageMessages.forEach(m => {
        const msgDiv = document.createElement('div');
        msgDiv.className = 'message-item';
        
        let ts = '';
        if (m.sent_at) {
            const dateObj = new Date(m.sent_at);
            if (!isNaN(dateObj.getTime())) {
                // Ajoute 1 heure pour le décalage fuseau horaire
                dateObj.setHours(dateObj.getHours() + 1);
                ts = dateObj.toLocaleDateString() + ' ' + dateObj.toLocaleTimeString();
            }
        }
        
        const timeSpan = document.createElement('span');
        timeSpan.className = 'message-time';
        timeSpan.textContent = ts;
        const contentSpan = document.createElement('span');
        contentSpan.className = 'message-content';
        contentSpan.textContent = m.content;
        msgDiv.appendChild(timeSpan);
        msgDiv.appendChild(contentSpan);
        container.appendChild(msgDiv);
    });

    // pagination controls
    let pager = parentDetails.querySelector('.pager');
    if (!pager) {
        pager = document.createElement('div');
        pager.className = 'pager';
        parentDetails.appendChild(pager);
    }
    pager.innerHTML = '';
    const totalPages = Math.ceil(messages.length / pageSize);
    if (page > 0) {
        const prev = document.createElement('button');
        prev.textContent = '← Prev';
        prev.onclick = () => renderMessagePage(parentDetails, page - 1);
        pager.appendChild(prev);
    }
    
    // page counter
    const counter = document.createElement('span');
    counter.className = 'page-counter';
    counter.textContent = `Page ${page + 1} / ${totalPages}`;
    pager.appendChild(counter);
    
    if (page < totalPages - 1) {
        const next = document.createElement('button');
        next.textContent = 'Next →';
        next.onclick = () => renderMessagePage(parentDetails, page + 1);
        pager.appendChild(next);
    }
}