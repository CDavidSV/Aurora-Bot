// import { ChatInputCommandInteraction, ColorResolvable, PermissionFlagsBits, SlashCommandBuilder, EmbedBuilder } from "discord.js";
// import config from "../../../config.json";

// export default {
//     data: new SlashCommandBuilder()
//         .setName('setnick')
//         .setDescription('🏷️ Set a nickname to the specified user')
//         .addUserOption(option => 
//             option
//                 .setName('user')
//                 .setDescription('User mention')
//                 .setRequired(true))
//         .addStringOption(option =>
//             option
//                 .setName('nickname')
//                 .setDescription('The nickname for the selected user')
//                 .setRequired(true)
//                 .setMinLength(1)
//                 .setMaxLength(32))
//         .addStringOption(option => 
//             option
//                 .setName('reason')
//                 .setDescription('Reason for changing the user\'s nickname')
//                 .setRequired(false))
//         .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
//         .setDMPermission(false),
//     botPerms: [PermissionFlagsBits.ManageNicknames, PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ManageNicknames, PermissionFlagsBits.ChangeNickname],
//     callback: async (interaction: ChatInputCommandInteraction) => {
//         const user = interaction.options.getUser('user', true);
//         const member = interaction.guild?.members.cache.get(user.id);
//         const nickname = interaction.options.getString('nickname', true);
//         const reason = interaction.options.getString('reason') || 'No reason specified';

//         await member?.setNickname(nickname, reason).then(async (member) => {
//             const nickEmbed = new EmbedBuilder()
//                 .setAuthor({ name: `${user.username}'s nickname has been changed to ${nickname}`, iconURL: config.embeds.images.successImg })
//                 .setColor(config.embeds.colors.success as ColorResolvable)
            
//             await interaction.reply({ embeds: [nickEmbed], ephemeral: true });
//         }).catch(async (err) => {
//             const errorEmbed = new EmbedBuilder()
//                 .setAuthor({ name: 'Unnable to change the nickname for that user', iconURL: config.embeds.images.errorImg })
//                 .setColor(config.embeds.colors.error as ColorResolvable)

//             await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
//         });
//     }
// }