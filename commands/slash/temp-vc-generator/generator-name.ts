import { CacheType, ChatInputCommandInteraction, ColorResolvable, EmbedBuilder } from "discord.js";
import { generatorSelect } from "../../../handlers/generator-select-handler";
import config from "../../../config.json";

export default {
    subCommand: "tempvc.generator_name",
    callback: async (interaction: ChatInputCommandInteraction<CacheType>) => {
        const generatorName = interaction.options.getString('name', true);

        generatorSelect(interaction, async (generatorId: string) => {
            const channel = interaction.guild?.channels.cache.get(generatorId);

            // Update the embed end edit the reply.
            const nameChangeEmbed = new EmbedBuilder()
            
            if (!channel) {
                nameChangeEmbed
                    .setColor(config.embeds.colors.error as ColorResolvable)
                    .setDescription("An error ocurred while trying to find the generator channel. It may have been deleted. Please try again.")
                    .setTitle("Error")
                    .setTimestamp()
            } else {
                const originalName = channel.name;
                await channel.setName(generatorName).then(() => {
                    nameChangeEmbed
                        .setColor(config.embeds.colors.success as ColorResolvable)
                        .setDescription(`The generator name has been changed from \`${originalName}\` to \`${generatorName}\``)
                        .setTitle("Generator Name Changed")
                        .setTimestamp()
                }).catch(() => {
                    nameChangeEmbed
                        .setColor(config.embeds.colors.error as ColorResolvable)
                        .setDescription("An error ocurred while trying to change the generator name. Please try again.")
                        .setTitle("Error")
                        .setTimestamp()
                });
            }

            try {
                if (!interaction.replied) {
                    interaction.reply({ embeds: [nameChangeEmbed], ephemeral: true });
                } else {
                    interaction.editReply({ embeds: [nameChangeEmbed], components: [] });
                }
            } catch (err) {
                console.error(err);
            }
        });
    }
}