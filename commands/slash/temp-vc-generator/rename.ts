import { ChatInputCommandInteraction, CacheType, StringSelectMenuInteraction, EmbedBuilder, ColorResolvable } from "discord.js";
import { generatorSelect } from "../../../handlers/generator-select-handler";
import config from "../../../config.json";
import tempvcGeneratorsScheema from "../../../scheemas/tempvcGeneratorsScheema";

export default {
    subCommand: 'tempvc.rename',
    callback: async (interaction: ChatInputCommandInteraction<CacheType>) => {

        generatorSelect(interaction, async (generatorId: string) => {
            const selectedOption = interaction.options.getBoolean('allow');
            const selectedChannel = generatorId
            const generatorEmbed = new EmbedBuilder().setFooter({ text: config.version });
            
            try {
                const generator = await tempvcGeneratorsScheema.findOneAndUpdate(
                    { guild_id: interaction.guildId, generator_id: selectedChannel }, 
                    { allow_rename: selectedOption }
                );
                generatorEmbed
                .setTitle('Generator settings successfully updated')
                .setColor(config.embeds.colors.success as ColorResolvable)
                .setDescription(`Allow renaming: ${generator?.allow_rename || "N/A"} -> ${selectedOption}`)
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