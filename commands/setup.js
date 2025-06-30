const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup')
        .setDescription('Displays information about the bot.'),
    async execute(interaction) {
        const botInfoEmbed = new EmbedBuilder()
            .setColor('Random') 
            .setTitle('Welcome to Setup - Catalyst AI')
            .setDescription('To begin using this bot, you can choose by typing the commands.')
            .addFields(
                { name: 'To View Maintenance', value: '/viewupdates' },
                { name: 'To View System Security', value: '/security', },
                { name: 'To View Ping Average', value: '/ping'},
                { name: 'To Make Creation', value: '/create **TITLE**'},
                { name: 'To Random Meme', value: '/meme'},
                { name: 'To Play some Music', value: '/play **YOUR_QUERY**'},
                { name: 'To Ban User', value: '/ban **TARGET_USER**'},
                { name: 'To Kick User', value: '/kick **TARGET_USER**'},
                { name: 'To View About', value: '/about'}
            )
            .setTimestamp()
            .setFooter({ text: 'Powered by Northden Studios', iconURL: interaction.client.user.displayAvatarURL() });

        await interaction.reply({ embeds: [botInfoEmbed] });
    },
};