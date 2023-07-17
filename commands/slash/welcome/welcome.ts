import { CommandInteraction, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { generateWelcomeResponse } from "../../../events/guildMemberAdd";
import guildScheema from "../../../scheemas/guildScheema";

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
        try {
            const guildSettings = await guildScheema.findById(interaction.guild?.id);

            // If the guild is not in the db then do nothing.
            // Check if the guild has welcome messages enabled.
            if (!guildSettings || !guildSettings.welcome || !guildSettings.welcome.welcome_channel) interaction.editReply('Welcome messages are not enabled in this server.');

            // Send a welcome message in the corresponding channel.
            const respose = await generateWelcomeResponse(guildSettings, interaction.user, interaction.guild!);

            await interaction.editReply(respose);
        } catch (err) {
            interaction.editReply('An Error Ocurred, Please Try Again.');
        }
    }
}