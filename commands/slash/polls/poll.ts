// import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js";

// export default {
//     data: new SlashCommandBuilder()
//         .setName('poll')
//         .setDescription('📊 Create and manage reaction based polls')
//         .addSubcommand(subcommand => 
//             subcommand
//                 .setName('create')
//                 .setDescription('📊 Create a reaction based poll'))
//         .addSubcommand(subcommand =>
//             subcommand
//                 .setName('stop')
//                 .setDescription('❌ Stop an ongoing poll'))
//         .addSubcommand(subcommand =>
//             subcommand
//                 .setName('list')
//                 .setDescription('📄 View all ongoing polls in this server'))
//         .addSubcommand(subcommand => 
//             subcommand
//                 .setName('results')
//                 .setDescription('📈 View a poll\'s results'))
//         .setDMPermission(false)
//         .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
//     botPerms: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.ManageChannels, PermissionFlagsBits.ManageMessages, PermissionFlagsBits.AddReactions, PermissionFlagsBits.ViewChannel]
// }