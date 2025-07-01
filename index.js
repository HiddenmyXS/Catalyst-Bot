const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits, ActivityType, IntentsBitField, EmbedBuilder } = require('discord.js');
const { token } = require('./config.json');
const { DisTube } = require('distube');

const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildVoiceStates, 
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent
    ] 
});

client.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    
    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
    } else {
        console.log(`[WARNING] Perintah di ${filePath} tidak memiliki properti "data" atau "execute" yang diperlukan.`);
    }
}

const eventsPath = path.join(__dirname, 'events');
const eventFiles = require('node:fs').readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
    console.log(`[EVENT] Loaded event: ${event.name}`);
}

client.once('ready', async (c) => {

    client.user.setActivity({
        name: 'Your Personal Bot!',
        type: ActivityType.Listening,
    });

    console.log(`Bot ${client.user.tag} sudah online!`);

    try {
        await client.player.extractors.loadMulti(DefaultExtractors, true);
        console.log('✅ Default extractors loaded successfully!');
    } catch {
        console.error('❌ Failed to load default extractors:', c.message);
    }
});

client.on('guildCreate', async guild => {
    let welcomeChannel = null;

    if (guild.systemChannel && guild.systemChannel.permissionsFor(guild.members.me).has('SendMessages')) {
        welcomeChannel = guild.systemChannel;
    }

    if (!welcomeChannel) {
        welcomeChannel = guild.channels.cache.find(channel => 
            channel.type === 0 &&
            channel.permissionsFor(guild.members.me).has('SendMessages') &&
            channel.name === 'general'
        );
    }

    if (!welcomeChannel) {
        welcomeChannel = guild.channels.cache.find(channel => 
            channel.type === 0 &&
            channel.permissionsFor(guild.members.me).has('SendMessages')
        );
    }

    if (welcomeChannel) {
        const welcomeEmbed = new EmbedBuilder()
            .setColor(0x00FF00) 
            .setTitle(`🎉 Hello from ${client.user.username}!`)
            .setDescription(
                `Thanks for inviting me to **${guild.name}**! I'm here to help you with various tasks.` +
                `\n\nTo get started, try typing \`/setup\` to see a list of my commands.` +
                `\nIf you need support or want to suggest features, use \`/support\`.` +
                `\n\nI recommend setting up a dedicated bot commands channel for a cleaner experience!`
            )
            .addFields(
                { name: 'Server Name', value: guild.name, inline: true },
                { name: 'Member Count', value: guild.memberCount.toString(), inline: true },
                { name: 'Distributed by', value: 'Northden Studios', inline: true }
            )
            .setTimestamp()
            .setFooter({ text: 'Powered by Northden Studios'});

        try {
            await welcomeChannel.send({ embeds: [welcomeEmbed] });
            console.log(`Sent welcome message to ${welcomeChannel.name} in ${guild.name}`);
        } catch (error) {
            console.error(`Could not send welcome message to ${guild.name} (Channel: ${welcomeChannel?.name || 'N/A'}):`, error);
        }
    } else {
        console.warn(`Could not find a suitable channel to send welcome message in ${guild.name}`);
    }
})

client.distube = new DisTube(client, {
    emitNewSongOnly: true
});

client.distube
    .on('playSong', (queue, song) => {
        const playEmbed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle('Now Playing')
            .setDescription(`[${song.name}](${song.url}) - \`${song.formattedDuration}\``)
            .setThumbnail(song.thumbnail)
            .addFields(
                { name: 'Requested by', value: `${song.user}`, inline: true },
                { name: 'Volume', value: `${queue.volume}%`, inline: true }
            )
            .setTimestamp();
        queue.textChannel.send({ embeds: [playEmbed] });
    })
    .on('addSong', (queue, song) => {
        const addSongEmbed = new EmbedBuilder()
            .setColor(0x00FF00)
            .setTitle('Added to Queue')
            .setDescription(`[${song.name}](${song.url}) - \`${song.formattedDuration}\``)
            .setThumbnail(song.thumbnail)
            .addFields(
                { name: 'Requested by', value: `${song.user}`, inline: true },
                { name: 'Position in queue', value: `${queue.songs.length}`, inline: true }
            )
            .setTimestamp();
        queue.textChannel.send({ embeds: [addSongEmbed] });
    })
    .on('addList', (queue, playlist) => {
        const addListEmbed = new EmbedBuilder()
            .setColor(0xFFA500)
            .setTitle('Added Playlist to Queue')
            .setDescription(`[${playlist.name}](${playlist.url}) - \`${playlist.songs.length}\` songs`)
            .setTimestamp();
        queue.textChannel.send({ embeds: [addListEmbed] });
    })
    .on('error', (channel, e) => {
        console.error(e);
        channel.send(`An error encountered: ${e.toString().slice(0, 1970)}`);
    })
    .on('empty', channel => channel.send('Voice channel is empty! Leaving the channel...'))
    .on('disconnect', channel => channel.send('Disconnected from voice channel.'));

    client.distube.on('searchResult', (message, results) => {
    let i = 0;
    message.channel.send(
        `**Choose an option from below**\n${results
            .map(song => `**${++i}**. ${song.name} - \`${song.formattedDuration}\``)
            .join('\n')}\n*Enter anything else or wait 30 seconds to cancel*`,
    );
});

client.login(token);
