import { ChannelType, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";

export default {
    data: new SlashCommandBuilder()
        .setName('tempvc')
        .setDescription('⌛ Manage and create temporary voice channels')
        .addSubcommand(subcommand => 
            subcommand
                .setName('create')
                .setDescription('⚙️ Configure settings for temporary voice channel generator')
                .addChannelOption(option =>
                    option
                        .setName('category')
                        .setDescription('Select a server category where temporary voice channels will be created')
                        .setRequired(true)
                        .addChannelTypes(ChannelType.GuildCategory))
                .addIntegerOption(option => 
                    option
                        .setName('limit')
                        .setMinValue(0)
                        .setMaxValue(99)
                        .setDescription('The maximum user limit for temporary voice channels'))
                .addStringOption(option =>
                    option
                        .setName('region')
                        .setDescription('Select a region')
                        .addChoices(
                            { name: 'Brazil', value: 'brazil' },
                            { name: 'Hong Kong', value: 'hongkong' },
                            { name: 'India', value: 'india' },
                            { name: 'Japan', value: 'japan' },
                            { name: 'Rotterdam', value: 'rotterdam' },
                            { name: 'Russia', value: 'russia' },
                            { name: 'Singapore', value: 'singapore' },
                            { name: "South Korea", value: 'south-korea' },
                            { name: 'South Africa', value: 'southafrica' },
                            { name: 'Sydney', value: 'sydney' },
                            { name: 'US Central', value: 'us-central' },
                            { name: 'US East', value: 'us-east' },
                            { name: 'US South', value: 'us-south' },
                            { name: 'US West', value: 'us-west' },
                        ))
                .addStringOption(option =>
                    option
                        .setName('custom_name')
                        .setDescription('Type in a custom vc name. Note: This name will be followed by a counter for that vc')
                        .setMinLength(1)
                        .setMaxLength(98))
                .addBooleanOption(option => 
                    option
                        .setName('allow_renaming')
                        .setDescription('Whether or not to allow the owner to change the vc name'))
                .addStringOption(option =>
                    option
                        .setName('generator_name')
                        .setDescription('Type in a name for the temporary vc generator')
                        .setMinLength(1)
                        .setMaxLength(98)))
        .addSubcommand(subcommand => 
            subcommand
                .setName('delete')
                .setDescription('🗑️ Deletes a temporary voice channel generator'))
        .addSubcommand(subcommand => 
            subcommand
                .setName('limit')
                .setDescription('🛑 Set the maximum user limit for temporary voice channels')
                .addIntegerOption(option => 
                    option
                        .setName('max')
                        .setMinValue(0)
                        .setMaxValue(99)
                        .setRequired(true)
                        .setDescription('The maximum user limit for temporary voice channels')))
        .addSubcommand(subcommand => 
            subcommand
                .setName('rename')
                .setDescription('✏️ Whether or not to allow the owner to change the vc name')
                .addBooleanOption(option => 
                    option
                        .setName('allow')
                        .setDescription('Set to true or false (default is false)')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('region')
                .setDescription('🗺️ Change the vc generator\'s region')
                .addStringOption(option =>
                    option
                        .setName('select')
                        .setDescription('Select a region')
                        .addChoices(
                            { name: 'Brazil', value: 'brazil' },
                            { name: 'Hong Kong', value: 'hongkong' },
                            { name: 'India', value: 'india' },
                            { name: 'Japan', value: 'japan' },
                            { name: 'Rotterdam', value: 'rotterdam' },
                            { name: 'Russia', value: 'russia' },
                            { name: 'Singapore', value: 'singapore' },
                            { name: "South Korea", value: 'south-korea' },
                            { name: 'South Africa', value: 'southafrica' },
                            { name: 'Sydney', value: 'sydney' },
                            { name: 'US Central', value: 'us-central' },
                            { name: 'US East', value: 'us-east' },
                            { name: 'US South', value: 'us-south' },
                            { name: 'US West', value: 'us-west' },
                        )
                        .setRequired(true)))
        .addSubcommand(subcommand => 
            subcommand
                .setName('name')
                .setDescription('🔧 Set a custom name for temporary voice channels')
                .addStringOption(option =>
                    option
                        .setName('custom_name')
                        .setDescription('🏷️ Type in a name. Note: This name will be followed by a counter for that vc')
                        .setMinLength(1)
                        .setMaxLength(98)
                        .setRequired(true)))
        .addSubcommand(subcommand => 
            subcommand
                .setName('settings')
                .setDescription('📋 Review the settings for a temporary vc generator'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('generator_name')
                .setDescription('📝 Change a tempv generator\'s name')
                .addStringOption(option =>
                    option
                        .setName('name')
                        .setDescription('Type in a name for the temporary vc generator')
                        .setMinLength(1)
                        .setMaxLength(98)
                        .setRequired(true)))
        .setDMPermission(false)
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    botPerms: [PermissionFlagsBits.ManageChannels, PermissionFlagsBits.MoveMembers],
    cooldown: 5,
}