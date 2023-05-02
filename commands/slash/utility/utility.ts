// import { CacheType, ChatInputCommandInteraction, PermissionsBitField, SlashCommandBuilder } from "discord.js";
// import config from "../../config.json";

// export default {
//     data: new SlashCommandBuilder()
//         .setName('utility')
//         .setDescription('🔨 Set of usefull commands')
//         .addSubcommand(subcommand =>
//             subcommand
//                 .setName('math')
//                 .setDescription('🧮 Solve an exprestion based math problem'))
//         .addSubcommand(subcommand =>
//             subcommand
//                 .setName('convert')
//                 .setDescription('🔢 Convert a specified unit to another format'))
//         .addSubcommand(subcommand =>
//             subcommand
//                 .setName('translate')
//                 .setDescription('📝 Translate an image or text to any language'))
//         .addSubcommand(subcommand =>
//             subcommand
//                 .setName('define')
//                 .setDescription('📚 Search the definition of a word')),
//     botPerms: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
//     async execute(interaction: ChatInputCommandInteraction<CacheType>) {
//     }
// }