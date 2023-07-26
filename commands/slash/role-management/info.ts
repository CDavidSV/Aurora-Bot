import { ChatInputCommandInteraction, ColorResolvable, EmbedBuilder, Role } from "discord.js";
import config from "../../../config.json";

export default {
    subCommand: 'role.info',
    callback: async (interaction: ChatInputCommandInteraction) => {
        let role = interaction.options.getRole('role') as Role;

        const roleEmbed: EmbedBuilder = new EmbedBuilder();
        if (!role) {
            roleEmbed
                .setColor(config.embeds.colors.error as ColorResolvable)
                .setAuthor({ name: 'El rol no existe. Intenta mencionarlos.', iconURL: 'attachment://error-icon.png' })
            interaction.reply({ embeds: [roleEmbed] });
            return;
        }

        // Role info.
        const name = role.name;
        const ID = role.id;
        const createdAt = Math.round(role.createdTimestamp / 1000);
        const memberSize = role.members.size;
        const color = role.color.toString(16);
        const position = role.position;

        let hoist: string;
        let managed: string;
        let mentionable: string;

        role.hoist ? hoist = '✓' : hoist = 'Χ';
        role.managed ? managed = '✓' : managed = 'Χ';
        role.mentionable ? mentionable = '✓' : mentionable = 'Χ';

        roleEmbed
            .setAuthor({ name: `${interaction.guild!.name}`, iconURL: interaction.guild?.iconURL({ forceStatic: false })! })
            .setFields(
                { name: 'Name', value: `${name}`, inline: true },
                { name: 'ID', value: `${ID}`, inline: true },
                { name: 'Creation Date', value: `<t:${createdAt}> (<t:${createdAt}:R>)`, inline: false },
                { name: 'Members in cache', value: `${memberSize}`, inline: true },
                { name: 'Position', value: `${position}`, inline: true },
                { name: 'Hex Color', value: `#${color.toUpperCase()}`, inline: true },
                { name: 'Hoisted', value: `${hoist}`, inline: true },
                { name: 'Managed', value: `${managed}`, inline: true },
                { name: 'Mantionable', value: `${mentionable}`, inline: true },
            )
            .setColor(role!.color);
        interaction.reply({ embeds: [roleEmbed], ephemeral: true });
    }
}