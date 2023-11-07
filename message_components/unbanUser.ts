import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle } from "discord.js";

export default {
    name: 'unban',
    callback: async (interaction: ButtonInteraction) => {
        try {
            const customIdParts = interaction.customId.split('.');
            const allowedUser = interaction.client.users.cache.get(customIdParts[2]);

            if (!allowedUser || interaction.user.id !== allowedUser.id) {
                await interaction.reply({ content: `You do not have permission to run this command.`, ephemeral: true});
                return;
            }

            const userId = customIdParts[1];
            const user = await interaction.client.users.fetch(userId).catch(() => undefined);
            if (!user) {
                await interaction.update({ components: [] });
                await interaction.reply('Unable to unban user.');
                return;
            }

            await interaction.guild?.members.unban(user).then(async () => {
                const row = new ActionRowBuilder<ButtonBuilder>()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('unbanned')
                            .setLabel('User unbanned')
                            .setStyle(ButtonStyle.Primary)
                            .setDisabled(true),
                    );

                await interaction.update({ components: [row] });
            }).catch(async () => {
                const row = new ActionRowBuilder<ButtonBuilder>()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('unbanned')
                            .setLabel('Unable to unban')
                            .setStyle(ButtonStyle.Primary)
                            .setDisabled(true),
                    );

                await interaction.update({ components: [row] }).catch(console.error);
            });
        } catch (error) {
            console.error(error);
        }
    }
}