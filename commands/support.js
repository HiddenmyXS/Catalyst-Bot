const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('support')
        .setDescription('Reading our documentation or support'),
    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setColor('Random')
            .setTitle('📲 Support - Catalyst')
            .setDescription('View our support or read documentation')
            .addFields(
                { name: 'View Documentation', value: 'https://catalyst.northden.com/documentation', inline: true},
                { name: 'View Help', value: 'https://catalyst.northden.com/help&support', inline: true }

            )
            .setTimestamp()
            .setFooter({ text: 'Powered by Northden Studios', iconURL: interaction.client.user.displayAvatarURL() });
        await interaction.reply({ embeds: [embed] });
    },
};