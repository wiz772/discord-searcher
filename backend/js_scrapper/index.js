const { Client, Collection } = require('discord.js-selfbot-v13');
const fs = require('fs');
const config = require('./config.json');

const batch_handler = require("./handlers/batch_handler.js");


// You need to create a config.json file with the following structure:
/*
{ 
    "tokens": [
        "your_token_1",
        "your_token_2",     
        // Add more tokens as needed
    ]
}
*/
const tokens = config.tokens; 


if (!Array.isArray(tokens) || tokens.length === 0) {
    console.error("No valid token found.");
    process.exit(1);
}



tokens.forEach((token, index) => {
    if (!token) return;

    const client = new Client({
        checkUpdate: false,
    });


    require('./handlers/events.js')(client);

    client.on('ready', () => {
        console.log(`${client.user.username} is on.`);
        batch_handler.flushChannels(client);
        batch_handler.flushGuilds(client);

    });

    client.login(token).catch(err => {
        console.error(`ERROR with token: ${index + 1}:`, err.message);
    });

    
});


