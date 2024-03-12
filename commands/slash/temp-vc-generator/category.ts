import { CacheType, ChatInputCommandInteraction, ColorResolvable, EmbedBuilder } from "discord.js";
import tempvcGeneratorsSchema from "../../../scheemas/tempvcGeneratorsSchema";
import { generatorSelect } from "../../../handlers/generator-select-handler";
import config from "../../../config.json";

export default {
    subCommand: 'tempvc.category',
    callback: async (interaction: ChatInputCommandInteraction<CacheType>) => {
        generatorSelect(interaction, async (generatorId: string) => {
            const category = interaction.options.getChannel('category', true);
            const generatorEmbed = new EmbedBuilder().setFooter({ text: config.version });
            
            try {
                const channel = interaction.guild!.channels.cache.get(generatorId);
                if (!channel) {
                    generatorEmbed
                    .setTitle('Unexpected Error')
                    .setColor(config.embeds.colors.error as ColorResolvable)
                    .setDescription("An unexpected error occurred while attempting to update the generator's settings. Please try again.")
                    .setTimestamp()
                    
                    interaction.reply({ embeds: [generatorEmbed], components: [], ephemeral: true  }).catch(console.error);
                    return;
                }

                const oldCategoryName = channel.parent!.name;
                await channel.edit({ parent: category.id, position: 0 });
                await tempvcGeneratorsSchema.findOneAndUpdate(
                    { guild_id: interaction.guildId, generator_id: generatorId }, 
                    { category_id: category.id }
                );
                generatorEmbed
                .setTitle('Generator settings successfully updated')
                .setColor(config.embeds.colors.success as ColorResolvable)
                .setDescription(`Category: ${oldCategoryName || "N/A"} -> ${category.name}`)
                .setTimestamp()
            } catch {
                generatorEmbed
                .setTitle('Unexpected Error')
                .setColor(config.embeds.colors.error as ColorResolvable)
                .setDescription("An unexpected error occurred while attempting to update the generator's settings. Please try again.")
                .setTimestamp()
            }

            if (!interaction.replied) {
                interaction.reply({ embeds: [generatorEmbed], components: [], ephemeral: true  }).catch(console.error);  
            } else {
                interaction.editReply({ embeds: [generatorEmbed], components: [] }).catch(console.error);
            }
        });
    }
}