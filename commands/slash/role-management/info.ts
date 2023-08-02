import { ActionRowBuilder, ChatInputCommandInteraction, ColorResolvable, EmbedBuilder, Role, RoleSelectMenuBuilder } from "discord.js";
import { getRoleInfo } from "../../../util/general";
import config from "../../../config.json";

export default {
    subCommand: 'role.info',
    callback: async (interaction: ChatInputCommandInteraction) => {
        let role = interaction.options.getRole('role') as Role;

        let roleEmbed: EmbedBuilder = new EmbedBuilder();
        if (!role) {
            roleEmbed
                .setColor(config.embeds.colors.error as ColorResolvable)
                .setAuthor({ name: 'El rol no existe. Intenta mencionarlos.', iconURL: 'attachment://error-icon.png' })
            interaction.reply({ embeds: [roleEmbed] });
            return;
        }

        // Build a select menu with all the roles.
        const roleSelect = new RoleSelectMenuBuilder()
            .setCustomId(`roleInfo`)
            .setPlaceholder('Select a role')
            .setMinValues(1)
            .setMaxValues(1)

        const row = new ActionRowBuilder<RoleSelectMenuBuilder>()
            .addComponents(roleSelect);

        // Role info.
        roleEmbed = getRoleInfo(role);
        await interaction.reply({ embeds: [roleEmbed], components: [row] });
    }
}