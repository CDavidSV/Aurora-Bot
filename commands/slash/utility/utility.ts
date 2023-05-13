import { PermissionsBitField, SlashCommandBuilder } from "discord.js";

export default {
    data: new SlashCommandBuilder()
        .setName('utility')
        .setDescription('🔨 Set of usefull commands')
        .addSubcommand(subcommand =>
            subcommand
                .setName('math')
                .setDescription('🧮 Solve an exprestion based math problem')
                .addStringOption(option =>
                    option
                        .setName('expression')
                        .setDescription('Enter any math expression here. e.g: (4 + 5) * 3')
                        .setMinLength(1)
                        .setRequired(true)
                ))
        // .addSubcommand(subcommand =>
        //     subcommand
        //         .setName('translate')
        //         .setDescription('📝 Translate an image or text to any language'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('define')
                .setDescription('📚 Search the definition of a word')
                .addStringOption(option =>
                    option
                        .setName('word')
                        .setDescription('word you want to get the definition for.')
                        .setRequired(true)))
        .setDMPermission(true),
    botPerms: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
}