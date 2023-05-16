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
        .addSubcommand(subcommand =>
            subcommand
                .setName('define')
                .setDescription('📚 Search the definition of a word')
                .addStringOption(option =>
                    option
                        .setName('word')
                        .setDescription('word you want to get the definition for.')
                        .setRequired(true)))
        .addSubcommandGroup(group =>
            group
                .setName('translate')
                .setDescription('📝 Translate an image or text to any language')
                .addSubcommand(subcommand =>
                    subcommand
                        .setName("image")
                        .setDescription("Translate text in an image")
                        .addAttachmentOption(attachment =>
                            attachment
                                .setName("image")
                                .setDescription("Image you want to have ranslated.")
                                .setRequired(true))
                        .addStringOption(option =>
                            option
                                .setName('language')
                                .setDescription('Language you want to have the text translated to (Default is English)')
                                .setAutocomplete(true)))
                .addSubcommand(subcommand =>
                    subcommand
                        .setName('text')
                        .setDescription('Translate text')
                        .addStringOption(option =>
                            option
                                .setName('text')
                                .setDescription('Text you want to have translated.')
                                .setMinLength(2)
                                .setMaxLength(2000)
                                .setRequired(true))
                        .addStringOption(option =>
                            option
                                .setName('language')
                                .setDescription('Language you want to have the text translated to (Default is English)')
                                .setAutocomplete(true))))
        .setDMPermission(true),
    botPerms: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
}