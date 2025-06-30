const { SlashCommandBuilder, EmbedBuilder, ApplicationCommandOptionType, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Ban a user from the server.')
        .addUserOption(option =>
            option
                .setName('target-user')
                .setDescription('The user you want to ban from the server.')
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName('reason')
                .setDescription('The reason for banning the user.')
                .setRequired(true) 
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers) 
        .setDMPermission(false), 

    async execute(interaction) {
       
        const targetUser = interaction.options.getMember('target-user');
       
        const reason = interaction.options.getString('reason') || "No reason provided!";
        
        await interaction.deferReply({ ephemeral: true }); 

        if (!targetUser) {
            await interaction.editReply("That user doesn't exist in this server.");
            return;
        }

        if (targetUser.id === interaction.guild.ownerId) {
            await interaction.editReply("You can't ban the server owner!");
            return;
        }

        if (targetUser.id === interaction.client.user.id) {
            await interaction.editReply("I cannot ban myself!");
            return;
        }

        const targetUserRolePosition = targetUser.roles.highest.position;
        const requestUserRolePosition = interaction.member.roles.highest.position;
        const botRolePosition = interaction.guild.members.me.roles.highest.position;

        if (targetUserRolePosition >= requestUserRolePosition) {
            await interaction.editReply("You cannot ban a user with the same or a higher role than you.");
            return;
        }

        if (targetUserRolePosition >= botRolePosition) {
            await interaction.editReply("The bot cannot ban a user with the same or a higher role than itself.");
            return;
        }

        if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.BanMembers)) {
            await interaction.editReply("I don't have permission to ban members in this server. Please give me the 'Ban Members' permission.");
            return;
        }

        try {
            await targetUser.ban({ reason: reason }); 
            const banEmbed = new EmbedBuilder()
                .setColor(0xFF0000) 
                .setTitle('❌ Member Banned - Catalyst')
                .setDescription(`${targetUser.user.tag} has been banned!`)
                .addFields(
                    { name: 'Moderator', value: interaction.user.tag, inline: true },
                    { name: 'Reason', value: reason, inline: true }
                )
                .setTimestamp()
                .setFooter({ text: 'Powered by Northden Studios', iconURL: interaction.client.user.displayAvatarURL() });
            await interaction.editReply({ embeds: [banEmbed], ephemeral: true });
        } catch (error) {
            console.error(`Error banning user ${targetUser.user.tag}:`, error);
            await interaction.editReply("An error occurred while trying to ban the user. Please check my permissions and role hierarchy.");
        }
    },
};