const { REST, Routes } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
const { clientId, guildId, token } = require('./config.json');

const commands = [];

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ('data' in command && 'execute' in command) {
        commands.push(command.data.toJSON());
    } else {
        console.log(`[WARNING] Perintah di ${filePath} tidak memiliki properti "data" atau "execute" yang diperlukan.`);
    }
}

const rest = new REST().setToken(token);

(async () => {
    try {
        console.log(`Memuat ulang ${commands.length} perintah commands! (/).`);

        const data = await rest.put(
            Routes.applicationCommands(clientId),
            { body: commands },
        );

        console.log(`Berhasil memuat ${data.length} perintah commands! (/).`);
    } catch (error) {
        console.error(error);
    }
})();