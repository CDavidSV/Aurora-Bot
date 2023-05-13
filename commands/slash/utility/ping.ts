import { CacheType, ChatInputCommandInteraction, ColorResolvable, EmbedBuilder, PermissionsBitField, SlashCommandBuilder } from "discord.js";
import config from "../../../config.json";

export default {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('🏓 Pong!'),
    botPerms: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
    callback: async (interaction: ChatInputCommandInteraction<CacheType>) => {
        const pingEmbed = new EmbedBuilder().setDescription('Calculating...');

        await interaction.reply({ embeds: [pingEmbed], fetchReply: true }).then(async resultMessage => {
            const ping = resultMessage.createdTimestamp - interaction!.createdTimestamp;
            pingEmbed
                .setAuthor({ name: 'Marin Bot', iconURL: interaction.client!.user!.avatarURL()! })
                .setDescription('🏓Pong!')
                .setColor(config.embeds.colors.main as ColorResolvable)
                .addFields(
                    { name: 'Bot Latency: ', value: `\`${ping}ms\`` },
                    { name: 'API Latency: ', value: `\`${interaction.client!.ws.ping}ms\`` }
                )
                .setFooter({ text: config.version })
                .setTimestamp()
            await interaction.editReply({ embeds: [pingEmbed] });
        })
    }
}