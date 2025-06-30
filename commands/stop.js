const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stop')
        .setDescription('Stops the music and clears the queue.'),
    async execute(interaction) {
        await interaction.deferReply();

        const queue = interaction.client.distube.getQueue(interaction.guildId);

        if (!queue) {
            const embed = new EmbedBuilder()
                .setColor('Orange')
                .setDescription('There is nothing playing right now!');
            return interaction.followUp({ embeds: [embed] });
        }

        try {
            queue.stop();
            const embed = new EmbedBuilder()
                .setColor('Green')
                .setDescription('Music stopped and queue cleared!');
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