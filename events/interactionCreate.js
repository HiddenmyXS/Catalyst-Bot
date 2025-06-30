const { Events } = require('discord.js');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if(!interaction.isChatInputCommand()) return;
        
        const command = interaction.client.commands.get(interaction.commandName);

        if(!command) {
            console.error(`No Command matching ${interaction.commandName} was found.`);
            return;
        }

        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(error);
            if(!interaction.deferred || interaction.replied) {
                await interaction.followUp({ content: `Error while trying to execute this commands!`, ephemeral: true});
            } else {
                await interaction.followUp({ content: `Error while trying to execute this commands!`, ephemeral: true});
            }
        }
    },
};