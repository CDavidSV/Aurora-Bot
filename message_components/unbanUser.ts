import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle } from "discord.js";

export default {
    name: 'unban',
    callback: async (interaction: ButtonInteraction) => {
        const allowedUser = interaction.client.users.cache.get(interaction.customId.split('.')[2]);

        if (!allowedUser || interaction.user.id !== allowedUser.id) {
            await interaction.reply({ content: `You do not have permission to run this command.`, ephemeral: true});
            return;
        }

        const userId = interaction.customId.split('.')[1];
        const user = await interaction.client.users.fetch(userId).catch(() => undefined);
        if (!user) {
            await interaction.update({ components: [] }).catch(console.error);
            await interaction.reply('Unable to unban user.');
            return;
        }
        
        const row = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('unbanned')
                .setLabel('User unbanned')
                .setStyle(ButtonStyle.Primary)
                .setDisabled(true),
        );

        interaction.guild?.members.unban(user).then(async () => {
            interaction.update({ components: [row] }).catch(console.error);
        }).catch(async () => {
            row.components[0].setLabel('Unable to unban')
            interaction.update({ components: [row] }).catch(console.error);
        });
    }
}