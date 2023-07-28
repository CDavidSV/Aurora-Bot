import { ChatInputCommandInteraction, ColorResolvable, ComponentType, EmbedBuilder } from "discord.js";
import { PaginationHandler } from "../../../handlers/pagination-handler";
import { paginate } from "../../../util/paginate";
import config from "../../../config.json";

export default {
    subCommand: 'role.list',
    callback: async (interaction: ChatInputCommandInteraction) => {
        const displayRoles = async (embedsList: EmbedBuilder[]) => {
            const handlePagination = new PaginationHandler(interaction.id, embedsList);
            const replyMsg = await interaction.reply({ embeds: [handlePagination.getCurrentEmbed()], components: [handlePagination.getButtons()], fetchReply: true });

            const collector = interaction.channel?.createMessageComponentCollector({ 
                componentType: ComponentType.Button, 
                filter: (colectorInteraction) => colectorInteraction.customId.split('.')[1] === handlePagination.getId(),
                time: 36_00_000
            });
            
            collector?.on('collect', async (interactionBtn) => {
                const page = handlePagination.getPageOnButtonId(interactionBtn.customId);

                if (!page) {
                    collector.stop();
                    await replyMsg.delete().catch(console.error);
                    return;
                }
                replyMsg.edit({ content: page.pageNumber, embeds: [page.embed], components: [page.buttons] }).catch(console.error);
                interactionBtn.deferUpdate().catch(console.error);
            });

            collector?.on('end', async () => {
                replyMsg.edit({ components: [] }).catch(console.error);
            });
        }

        const user = interaction.options.getUser('user');

        // Check if a user option was provided.
        if (!user) {
            const roles = interaction.guild?.roles.cache.map(role => `<@&${role.id}>`);

            if (!roles || roles.length === 0) {
                await interaction.reply({ content: 'There are no roles in this server.', ephemeral: true });
                return;
            }

            const embedsList = paginate(roles, 10, { title: 'Roles', description: `List of roles in ${interaction.guild?.name}[${roles.length}]`, thumbnail: interaction.guild?.iconURL(), color: config.embeds.colors.main as ColorResolvable });
            
            await displayRoles(embedsList);
            return;
        }

        const member = interaction.guild?.members.cache.get(user!.id);

        // Handle if the member is not in the server.
        if (!member) {
            await interaction.reply({ content: 'User not found.', ephemeral: true });
            return;
        }

        const roles = member.roles.cache.map(role => `<@&${role.id}>`);

        if (!roles || roles.length === 0) {
            await interaction.reply({ content: 'This user has no roles.', ephemeral: true });
        }

        const embedsList = paginate(roles, 10, { title: 'Roles', description: `List of roles for ${member.user.username}`, thumbnail: interaction.guild?.iconURL(), color: config.embeds.colors.main as ColorResolvable });
        await displayRoles(embedsList);
    }
}