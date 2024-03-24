import { ButtonInteraction, ColorResolvable, EmbedBuilder } from "discord.js";
import config from '../config.json';

export default {
    name: 'userPerms',
    callback: async (interaction: ButtonInteraction) => {
        const userId: string = interaction.customId.split('.')[1];
        const member = await interaction.guild?.members.fetch(userId).catch(() => null);
       
        if (!member) {
            interaction.reply({ content: 'Member not found in server.', ephemeral: true }).catch(console.error);
            return;
        }

        const permissions = member.permissions.toArray().map((perm, index) => `**${index + 1}.** ${perm}`).join('\n');
        const permsEmbed = new EmbedBuilder()
            .setTitle(`${member.displayName}'s Permissions`)
            .setColor(config.embeds.colors.main as ColorResolvable)
            .setDescription(`${permissions}`)
            .setFooter({ text: interaction.guild?.name!, iconURL: interaction.guild?.iconURL({ forceStatic: false })! })
            .setTimestamp()
        
        await interaction.reply({ embeds: [permsEmbed], ephemeral: true });
    }
}