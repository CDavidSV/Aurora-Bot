import { ActionRowBuilder, RoleSelectMenuBuilder, RoleSelectMenuInteraction } from "discord.js";
import { getRoleInfo } from "../util/herper-functions";

export default {
    name: 'roleInfo',
    callback: async (interaction: RoleSelectMenuInteraction) => {
        const role = interaction.guild?.roles.cache.get(interaction.values[0]);

        const roleSelect = new RoleSelectMenuBuilder()
            .setCustomId(`roleInfo`)
            .setPlaceholder('Select a role')
            .setMinValues(1)
            .setMaxValues(1)

        const row = new ActionRowBuilder<RoleSelectMenuBuilder>()
            .addComponents(roleSelect);

        if (!role) return await interaction.update({ content: 'Role not found', components: [row] });
        const embed = getRoleInfo(role);

        await interaction.update({ embeds: [embed], components: [row] });
    }
}