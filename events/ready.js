const { Events } = require('discord.js');
const { once } = require('events');

module.exports = {
    name: Events.ClientReady,
    once: true,
    execute(client) {
        console.log(`✅ Status OK! | Logged in as ${client.user.tag}`);
    },
};