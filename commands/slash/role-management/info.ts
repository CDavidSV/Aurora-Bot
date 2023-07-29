import { ActionRowBuilder, ChatInputCommandInteraction, ColorResolvable, ComponentType, EmbedBuilder, Role, RoleSelectMenuBuilder } from "discord.js";
import { roleInfo } from "../../../util/general";
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
            .setCustomId(`role.${interaction.id}`)
            .setPlaceholder('Select a role')
            .setMinValues(1)
            .setMaxValues(1)

        const row = new ActionRowBuilder<RoleSelectMenuBuilder>()
            .addComponents(roleSelect);

        // Role info.
        roleEmbed = roleInfo(role);
        const reply = await interaction.reply({ embeds: [roleEmbed], components: [row], fetchReply: true });

        const collector = interaction.channel?.createMessageComponentCollector({
            componentType: ComponentType.RoleSelect,
            filter: (m) => m.message.id === reply.id
        });
        
        collector?.on('collect', (collectedInteraction) => {
            const role = collectedInteraction.guild?.roles.cache.get(collectedInteraction.values[0]);

            if (!role) return;
            const embed = roleInfo(role);

            collectedInteraction.message.edit({ embeds: [embed], components: [row] }).catch(console.error);
            collectedInteraction.deferUpdate();
        });
    }
}