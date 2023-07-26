import { ChatInputCommandInteraction, ColorResolvable } from "discord.js";
import { paginate, handlePagination, ReplyType } from "../../../handlers/pagination-handler";
import config from "../../../config.json";

export default {
    subCommand: 'role.list',
    callback: async (interaction: ChatInputCommandInteraction) => {
        const user = interaction.options.getUser('user');

        // Check if a user option was provided.
        if (!user) {
            const roles = interaction.guild?.roles.cache.map(role => `<@&${role.id}>`);

            if (!roles || roles.length === 0) {
                await interaction.reply({ content: 'There are no roles in this server.', ephemeral: true });
                return;
            }

            const embedsList = paginate(roles, { title: 'Roles', description: `List of roles in ${interaction.guild?.name}[${roles.length}]`, thumbnail: interaction.guild?.iconURL(), color: config.embeds.colors.main as ColorResolvable });
            await handlePagination(interaction, embedsList, ReplyType.REPLY);
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

        const embedsList = paginate(roles, { title: 'Roles', description: `List of roles for ${member.user.username}`, thumbnail: interaction.guild?.iconURL(), color: config.embeds.colors.main as ColorResolvable });
        await handlePagination(interaction, embedsList, ReplyType.REPLY);
    }
}