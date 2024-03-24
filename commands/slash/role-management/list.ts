import { ActionRowBuilder, ChatInputCommandInteraction, ColorResolvable, ComponentType, EmbedBuilder, RoleSelectMenuBuilder } from "discord.js";
import { PaginationHandler } from "../../../handlers/pagination-handler";
import { paginate } from "../../../util/paginate";
import config from "../../../config.json";
import { getRoleInfo } from "../../../util/herper-functions";

export default {
    subCommand: 'role.list',
    callback: async (interaction: ChatInputCommandInteraction) => {
        const displayRoles = async (embedsList: EmbedBuilder[], roles: string[]) => {
            // Build a select menu with all the roles.
            const roleSelect = new RoleSelectMenuBuilder()
                .setCustomId(`role.${interaction.id}`)
                .setPlaceholder('Select a role')
                .setMinValues(1)
                .setMaxValues(1)

            const row = new ActionRowBuilder<RoleSelectMenuBuilder>()
                .addComponents(roleSelect);

            const handlePagination = new PaginationHandler(embedsList);

            const replyMsg = await interaction.reply({ content: handlePagination.getPageNumber(), embeds: [handlePagination.getCurrentEmbed()], components: [row, handlePagination.getButtons()], fetchReply: true }).catch(() => null);
            if (!replyMsg) return;

            const collector = interaction.channel?.createMessageComponentCollector({ 
                filter: (colectorInteraction) => colectorInteraction.message.id === replyMsg.id,
                time: 3_600_000
            });

            collector?.on('end', () => {
                replyMsg.edit({ components: [] }).catch(console.error);
            });
            
            collector?.on('collect', async (collectedInteraction) => {
                if (collectedInteraction.componentType === ComponentType.RoleSelect) {
                    const role = collectedInteraction.guild?.roles.cache.get(collectedInteraction.values[0]);
                    
                    if (!role) {
                        collectedInteraction.deferReply().catch(console.error);
                        return;
                    } 
                    const embed = getRoleInfo(role);
                    const roleRow = new ActionRowBuilder<RoleSelectMenuBuilder>()
                        .addComponents(new RoleSelectMenuBuilder()
                        .setCustomId(`roleInfo`)
                        .setPlaceholder('Select a role')
                        .setMinValues(1)
                        .setMaxValues(1));

                    collectedInteraction.reply({ embeds: [embed], components: [roleRow], ephemeral: true }).catch(console.error);
                    return;
                }

                // It's a button Interactions.
                const page = handlePagination.getPageOnButtonId(collectedInteraction.customId);

                if (!page) {
                    collector.removeAllListeners();
                    collector.stop();
                    collectedInteraction.message.delete().catch(console.error);
                    return;
                }
                collectedInteraction.update({ content: page.pageNumber, embeds: [page.embed], components: [row, page.buttons] }).catch(console.error);
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
            
            displayRoles(embedsList, roles).catch(console.error);
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
        await displayRoles(embedsList, roles);
    }
}