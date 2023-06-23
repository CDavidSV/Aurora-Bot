import { ChatInputCommandInteraction, CacheType, ColorResolvable, EmbedBuilder, ComponentType } from "discord.js";
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
            const category = interaction.guild?.channels.cache.get(selectedGenerator.generator_id);
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
    
            await interaction.reply({ embeds: [generatorEmbed] });
            return;
        }
    
        const selectRow = await buildSelector(interaction, generators);
        const selectCollector = interaction.channel?.createMessageComponentCollector({
            filter: (selectInteraction) =>
            selectInteraction.customId === interaction.id && selectInteraction.user.id === interaction.user.id,
            componentType: ComponentType.StringSelect,
            time: 180_000
        });

        // if there are multiple generators, send the selector
        const generatorEmbed = new EmbedBuilder()
        .setAuthor({ name: 'Aurora Bot', iconURL: interaction.client!.user!.avatarURL()! })
        .setTitle('Generator Select')
        .setDescription("Select a generator.\n**Important:** Deleted generator channels will also appear here.")
        .setColor(config.embeds.colors.main as ColorResolvable)
        .setFooter({ text: config.version })
        .setTimestamp();

        await interaction.reply({ embeds: [generatorEmbed], components: [selectRow], ephemeral: true });
    
        selectCollector?.on('collect', async (selectInteraction) => {
            const selectedValue = selectInteraction.values[0];
            const selectedGenerator = generators.find((generator) => generator.generator_id === selectedValue)!;
    
            const category = interaction.guild?.channels.cache.get(selectedGenerator.category_id);
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
    
            selectRow.components[0].options.forEach(option => {
            option.setDefault(option.data.value === selectedValue);
            });
    
            await interaction.editReply({ embeds: [generatorEmbed], components: [selectRow] });
            selectInteraction.deferUpdate();
        });
        
        // interaction timeout
        selectCollector?.on('end', async () => {
            selectCollector?.removeAllListeners().stop();
            await interaction.editReply({ components: [] });
        });
    }
};