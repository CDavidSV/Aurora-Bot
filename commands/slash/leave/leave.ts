import { ColorResolvable, CommandInteraction, EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import guildSchema from "../../../schemas/guildSchema";
import config from '../../../config.json';

export default {
    data: new SlashCommandBuilder()
        .setName('leave')
        .setDescription('🚪 Leave messages')
        .addSubcommand(subCommand => 
            subCommand
                .setName('test')
                .setDescription('🚪 Test leave message'))
        .setDMPermission(false)
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    botPerms: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages],
    callback: async (interaction: CommandInteraction) => {
        await interaction.deferReply();
        // Check if the server the user joined has welcome messages enabled.
        const guildSettings = await guildSchema.findById(interaction.guild?.id);

        // If the guild is not in the db then do nothing.
        // Check if the guild has welcome messages enabled.
        if (!guildSettings || !guildSettings.goodbye || !guildSettings.goodbye.goodbye_channel) { 
            await interaction.editReply('Leave messages are not enabled in this server. Use </settings leave channel:1130343177728053328> to enable them');
            return;
        };

        let message = guildSettings.goodbye.goodbye_message || `<@${interaction.user.id}> just left the server! Bye 👋`;

        // Send a welcome message in the corresponding channel.
        message = message.replace(/{\s*username\s*}/gm, interaction.user.username);
        message = message.replace(/{\s*mention\s*}/gm, `<@${interaction.user.id}>`);
        message = message.replace(/{\s*id\s*}/gm, interaction.user.id);
        message = message.replace(/{\s*server\s*}/gm, interaction.guild!.name);
        message = message.replace(/{\s*members\s*}/gm, interaction.guild!.memberCount.toString());

        const image = guildSettings.goodbye.goodbye_image || null;

        if (guildSettings.goodbye.embed) {
            // Generate the emped
            const welcomeEmbed = new EmbedBuilder()
                .setAuthor({ name: interaction.guild?.name as string, iconURL: interaction.guild?.iconURL() as string})
                .setDescription(message)
                .setColor(config.embeds.colors.main as ColorResolvable)
                .setImage(image)
                .setTimestamp()
            
            return await interaction.editReply({ embeds: [welcomeEmbed] });
        }

        await interaction.editReply({ content: message, files: image ? [image] : [] });
    }
}