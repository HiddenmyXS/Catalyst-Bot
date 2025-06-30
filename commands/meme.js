const { SlashCommandBuilder, EmbedBuilder } = require ('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('meme')
        .setDescription('Fetches a random meme!'),
    async execute(interaction) {
        await interaction.deferReply(); 
        try {
            const response = await fetch('https://meme-api.com/gimme'); 
            const data = await response.json();

            if (!data || !data.url) {
                return interaction.editReply('Could not fetch a meme at this time. Please try again later!');
            }

            const memeEmbed = new EmbedBuilder()
                .setColor(0x0099FF)
                .setTitle(data.title || 'Random Meme')
                .setURL(data.postLink || 'https://reddit.com/r/memes')
                .setImage(data.url) 
                .setFooter({ text: `From r/${data.subreddit || 'memes'} | Requested by ${interaction.user.tag}` });

            await interaction.editReply({ embeds: [memeEmbed] });

        } catch (error) {
            console.error('Error fetching meme:', error);
            await interaction.editReply('There was an error trying to fetch a meme!');
        }
    },
};