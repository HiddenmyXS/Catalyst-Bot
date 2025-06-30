const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('skip')
        .setDescription('Skips the current song.'),
    async execute(interaction) {
        await interaction.deferReply();

        const queue = interaction.client.distube.getQueue(interaction.guildId);

        if (!queue || !queue.songs.length) {
            const embed = new EmbedBuilder()
                .setColor('Orange')
                .setDescription('There is nothing in the queue right now!');
            return interaction.followUp({ embeds: [embed] });
        }

        try {
            const song = await queue.skip();
            const embed = new EmbedBuilder()
                .setColor('Green')
                .setDescription(`Skipped! Now playing:\n**[${song.name}](${song.url})**`);
            interaction.followUp({ embeds: [embed] });
        } catch (e) {
            console.error(e);
            const embed = new EmbedBuilder()
                .setColor('Red')
                .setDescription(`An error occurred: \`${e.message.slice(0, 1970)}\``);
            await interaction.followUp({ embeds: [embed] });
        }
    },
};