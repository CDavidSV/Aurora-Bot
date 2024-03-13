import { CommandInteraction, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { generateWelcomeResponse } from "../../../events/guildMemberAdd";
import guildSchema from "../../../schemas/guildSchema";

export default {
    data: new SlashCommandBuilder()
        .setName('welcome')
        .setDescription('👋 Welcome messages')
        .addSubcommand(subCommand => 
            subCommand
                .setName('test')
                .setDescription('👋 Test welcome message'))
        .setDMPermission(false)
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    botPerms: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages],
    callback: async (interaction: CommandInteraction) => {
        await interaction.deferReply();
        // Check if the server the user joined has welcome messages enabled.
        const guildSettings = await guildSchema.findById(interaction.guild?.id);

        // If the guild is not in the db then do nothing.
        // Check if the guild has welcome messages enabled.
        if (!guildSettings || !guildSettings.welcome || !guildSettings.welcome.welcome_channel) { 
            await interaction.editReply('Welcome messages are not enabled in this server. Use </settings welcome channel:1130343177728053328> to enable them');
            return;
        };

        // Send a welcome message in the corresponding channel.
        const respose = await generateWelcomeResponse(guildSettings, interaction.user, interaction.guild!);

        await interaction.editReply(respose);
    }
}