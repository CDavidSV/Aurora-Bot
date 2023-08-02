import { AnySelectMenuInteraction, ColorResolvable, EmbedBuilder } from "discord.js";
import config from '../config.json';
import { buildSelector, getGenerators } from "../handlers/generator-select-handler";

export default {
    name: 'viewGeneratorSettings',
    callback: async (interaction: AnySelectMenuInteraction) => {
        const selectedValue = interaction.values[0];
        const generators = await getGenerators(interaction.guild?.id!);

        if (!generators) return await interaction.update({ components: [], embeds: [], content: 'This server has no temporary vc generators' }).catch(console.error);
        const selectedGenerator = generators.find((generator) => generator.generator_id === selectedValue)!;

        const selectRow = await buildSelector(`viewGeneratorSettings`, interaction, generators);
        selectRow.components[0].options.forEach(option => {
            option.setDefault(option.data.value === selectedValue);
        });

        if (!selectedGenerator) {
            if (generators.length == 1) {
                return await interaction.update({ content: 'Generator no longer exists', components: [] }).catch(console.error);
            } else {
                return await interaction.update({ content: 'Generator no longer exists', components: [selectRow] }).catch(console.error);
            }
        }

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

        await interaction.update({ embeds: [generatorEmbed], components: [selectRow] }).catch(console.error);
    }
}