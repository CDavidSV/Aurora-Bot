import { ChatInputCommandInteraction, CacheType, ColorResolvable, EmbedBuilder } from "discord.js";
import { getGenerators, buildSelector } from "../../../handlers/generator-select-handler";
import config from "../../../config.json";

export default {
    subCommand: "tempvc.settings",
    callback: async (interaction: ChatInputCommandInteraction<CacheType>) => {
        // Get generators and check if there are any for this guild
        const generators = await getGenerators(interaction.guild?.id!);
    
        if (!generators || generators.length < 1) {
            await interaction.reply({ content: "This server doesn't have any voice channel generators", ephemeral: true });
            return;
        }

        // if there is only one generator, send the settings for that generator
        if (generators.length === 1) {
            const selectedGenerator = generators[0];
            const category = interaction.guild?.channels.cache.get(selectedGenerator.category_id!);
            const allowRenameString = selectedGenerator.allow_rename ? "✔" : "✖";
    
            const generatorEmbed = new EmbedBuilder()
                .setAuthor({ name: 'Aurora Bot', iconURL: interaction.client!.user!.avatarURL()! })
                .setThumbnail(interaction.guild?.iconURL()!)
                .setColor(config.embeds.colors.main as ColorResolvable)
                .setDescription(`**Settings for** <#${selectedGenerator.generator_id}> :`)
                .setFields([
                    { name: 'Category', value: category?.name || 'No name' },
                    { name: 'Limit', value: selectedGenerator.vc_user_limit?.toString() || 'Not specified', inline: true },
                    { name: 'Region', value: selectedGenerator.region || 'Not specified', inline: true },
                    { name: 'Custom name', value: selectedGenerator.custom_vc_name || 'Not Specified', inline: true },
                    { name: 'Allow Renaming', value: allowRenameString, inline: true }
                ]);
    
            await interaction.reply({ embeds: [generatorEmbed], ephemeral: true });
            return;
        }
    
        const selectRow = await buildSelector(`viewGeneratorSettings`, interaction, generators);

        // if there are multiple generators, send the selector
        const generatorEmbed = new EmbedBuilder()
            .setAuthor({ name: 'Aurora Bot', iconURL: interaction.client!.user!.avatarURL()! })
            .setTitle('Generator Select')
            .setDescription("Select a generator.\n**Important:** Deleted generator channels will also appear here.")
            .setColor(config.embeds.colors.main as ColorResolvable)
            .setFooter({ text: config.version })
            .setTimestamp();

        await interaction.reply({ embeds: [generatorEmbed], components: [selectRow], ephemeral: true });
    }
};