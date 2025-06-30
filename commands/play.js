const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { DisTubeError } = require('distube'); 

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Plays a song or adds it to the queue.')
        .addStringOption(option =>
            option.setName('query')
                .setDescription('The song name or URL (YouTube, Spotify, SoundCloud, etc.)')
                .setRequired(true)),
    async execute(interaction) {
        await interaction.deferReply(); 

        const query = interaction.options.getString('query');
        const voiceChannel = interaction.member.voice.channel;

        if (!voiceChannel) {
            const embed = new EmbedBuilder()
                .setColor('Red')
                .setDescription('You need to be in a voice channel to play music!');
            return interaction.followUp({ embeds: [embed] });
        }

        try {
            const queue = await interaction.client.distube.play(voiceChannel, query, {
                member: interaction.member,
                textChannel: interaction.channel,
            });

            if (queue && queue.songs.length > 0) {
                const song = queue.songs[0]; 
                const embed = new EmbedBuilder()
                    .setColor('Green')
                    .setDescription(`🎶 **Playing:** [${song.name}](${song.url})\n**Duration:** \`${song.formattedDuration}\``);
                return interaction.followUp({ embeds: [embed] });
            } else {
                
                const embed = new EmbedBuilder()
                    .setColor('Orange')
                    .setDescription(`Started playing music for "${query}".`);
                return interaction.followUp({ embeds: [embed] });
            }

        } catch (e) {
            console.error('DisTube Play Error:', e); 

            let errorMessage = 'An unexpected error occurred while trying to play music.';
            if (e instanceof DisTubeError) {
                switch (e.errorCode) {
                    case 'NO_RESULT':
                        errorMessage = `❌ I couldn't find any song matching "${query}". Please try a different query or a direct YouTube URL.`;
                        break;
                    case 'VALIDATION_ERROR':
                        errorMessage = `❌ Invalid query or URL provided. Please check your input.`;
                        break;
                    case 'NOT_SUPPORTED_URL':
                        errorMessage = `❌ The provided URL is not supported. Try a YouTube, Spotify, or SoundCloud link (if plugins are enabled).`;
                        break;
                    case 'UNAVAILABLE_VIDEO':
                        errorMessage = `❌ This video is unavailable or restricted.`;
                        break;
                    case 'NO_QUEUE':
                        errorMessage = `❌ There's no active queue. Something went wrong after playing the first song.`;
                        break;
                    default:
                        errorMessage = `An error occurred: \`${e.message.slice(0, 1900)}\``;
                }
            } else {
                errorMessage = `An internal error occurred: \`${e.message.slice(0, 1900)}\``;
            }

            const errorEmbed = new EmbedBuilder()
                .setColor('Red')
                .setDescription(errorMessage);
            await interaction.followUp({ embeds: [errorEmbed] });
        }
    },
};