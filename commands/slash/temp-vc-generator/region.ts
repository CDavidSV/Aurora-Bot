import { ChatInputCommandInteraction, CacheType, StringSelectMenuInteraction, EmbedBuilder, ColorResolvable } from "discord.js";
import { generatorSelect } from "../../../handlers/generator-select-handler";
import config from "../../../config.json";
import tempvcGeneratorsScheema from "../../../scheemas/tempvcGeneratorsScheema";

export default {
    subCommand: 'tempvc.region',
    callback: async (interaction: ChatInputCommandInteraction<CacheType>) => {
        generatorSelect(interaction, async (generatorId: string) => {
            const generatorEmbed = new EmbedBuilder().setFooter({ text: config.version });
            const selectedChannel = generatorId;
            const selectedRegion = interaction.options.getString('select');
            
            try {
                const generator = await tempvcGeneratorsScheema.findOneAndUpdate(
                    { guild_id: interaction.guildId, generator_id: selectedChannel }, 
                    { region: selectedRegion }
                );

                // Change channel region.
                await interaction.guild?.channels.cache.get(selectedChannel)?.edit({ rtcRegion: selectedRegion});

                generatorEmbed
                .setTitle('Generator settings successfully updated')
                .setColor(config.embeds.colors.success as ColorResolvable)
                .setDescription(`Region: ${generator?.region || "N/A"} -> ${selectedRegion}`)
                .setTimestamp()
            } catch {
                generatorEmbed
                .setTitle('Unexpected Error')
                .setColor(config.embeds.colors.error as ColorResolvable)
                .setDescription("An unexpected error occurred while attempting to update the generator's settings. Please try again.")
                .setTimestamp()
            }

            if (!interaction.replied) {
                await interaction.reply({ embeds: [generatorEmbed], components: [], ephemeral: true  });
            } else {
                await interaction.editReply({ embeds: [generatorEmbed], components: [] });
            }
        });
    }
}