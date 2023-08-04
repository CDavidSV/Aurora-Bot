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

        if (!role) return await interaction.update({ content: 'Role not found', components: [row] }).catch(console.error);
        const embed = getRoleInfo(role);

        interaction.update({ embeds: [embed], components: [row] }).catch(console.error);
    }
}