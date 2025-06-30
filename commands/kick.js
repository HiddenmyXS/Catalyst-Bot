const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Kicks a member from the server.')
        .addUserOption(option =>
            option.setName('target')
                .setDescription('The member to kick.')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('The reason for kicking this member.')
                .setRequired(false)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers) 
        .setDMPermission(false), 

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true }); 

        const targetUser = interaction.options.getUser('target');
        const reason = interaction.options.getString('reason') || 'No reason provided.';

        const targetMember = interaction.guild.members.cache.get(targetUser.id);
        const botMember = interaction.guild.members.cache.get(interaction.client.user.id);

        if (!targetMember) {
            return interaction.editReply({
                content: `Could not find that member in this server.`,
                ephemeral: true,
            });
        }

        if (targetMember.roles.highest.position >= botMember.roles.highest.position) {
            return interaction.editReply({
                content: `I cannot kick ${targetUser.tag} because their highest role is equal to or higher than my highest role.`,
                ephemeral: true,
            });
        }

        if (targetMember.roles.highest.position >= interaction.member.roles.highest.position && interaction.member.id !== interaction.guild.ownerId) {
            return interaction.editReply({
                content: `You cannot kick ${targetUser.tag} because their highest role is equal to or higher than your highest role.`,
                ephemeral: true,
            });
        }

        if (targetMember.id === interaction.guild.ownerId) {
            return interaction.editReply({
                content: `You cannot kick the server owner!`,
                ephemeral: true,
            });
        }

        if (targetMember.id === botMember.id) {
            return interaction.editReply({
                content: `I cannot kick myself!`,
                ephemeral: true,
            });
        }

        try {
            await targetMember.kick({ reason: reason});
            const kickEmbed = new EmbedBuilder()
                .setColor(0xFF0000) 
                .setTitle('❌ Member Kicked - Catalyst')
                .setDescription(`**${targetUser.tag}** has been kicked from the server.`)
                .addFields(
                    { name: 'Kicked User', value: `${targetUser.tag} (${targetUser.id})`, inline: true },
                    { name: 'Kicked By', value: `${interaction.user.tag} (${interaction.user.id})`, inline: true },
                    { name: 'Reason', value: reason }
                )
                .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
                .setFooter({ text: 'Powered by Northden Studios', iconURL: interaction.client.user.displayAvatarURL() })
                .setTimestamp();

            await interaction.channel.send({ embeds: [kickEmbed] });
            await interaction.editReply({ content: `Successfully kicked ${targetUser.tag}.` });

        } catch (error) {
            console.error(`Error kicking member ${targetUser.tag}:`, error);
            let errorMessage = `Failed to kick ${targetUser.tag}. Make sure I have the "Kick Members" permission and my role is higher than the target's role.`;
            if (error.code === 50013) { 
                errorMessage = `I do not have permission to kick ${targetUser.tag}. Please ensure my role has "Kick Members" and is above their highest role.`;
            }
            await interaction.editReply({
                content: errorMessage,
                ephemeral: true,
            });
        }
    },
};