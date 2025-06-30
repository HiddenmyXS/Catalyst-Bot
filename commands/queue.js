const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('queue')
        .setDescription('Shows the current music queue.'),
    async execute(interaction) {
        await interaction.deferReply();

        const queue = interaction.client.distube.getQueue(interaction.guildId);

        if (!queue || !queue.songs.length) {
            const embed = new EmbedBuilder()
                .setColor('Orange')
                .setDescription('There is nothing in the queue right now!');
            return interaction.followUp({ embeds: [embed] });
        }

        const embed = new EmbedBuilder()
            .setColor('Blue')
            .setTitle('Current Queue')
            .setDescription(
                `Currently playing: **[${queue.songs[0].name}](${queue.songs[0].url})** (${queue.songs[0].formattedDuration})\n\n` +
                (queue.songs.length > 1
                    ? queue.songs
                        .slice(1, 11)
                        .map((song, i) => `${i + 1}. [${song.name}](${song.url}) - \`${song.formattedDuration}\``)
                        .join('\n')
                    : 'No more songs in the queue.')
            )
            .setFooter({ text: `Total songs: ${queue.songs.length}` })
            .setTimestamp();

        interaction.followUp({ embeds: [embed] });
    },
};