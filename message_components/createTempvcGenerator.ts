import { ButtonInteraction, ChannelType, ColorResolvable, EmbedBuilder } from "discord.js";
import tempvcGeneratorsSchema from "../schemas/tempvcGeneratorsSchema";
import config from "../config.json";

export default {
    name: 'createTempvcGenerator',
    callback: async (interaction: ButtonInteraction) => {

        const category = interaction.guild?.channels.cache.first();
        if (!category) return interaction.reply({ content: "Failed to create generator channel. No category found in this server.", ephemeral: true }).catch(console.error);

        try {
            const channel = await interaction.guild?.channels.create({ 
                name: "➕ VC Generator",
                type: ChannelType.GuildVoice,
                parent: category?.id,
                position: 0
            });
            if (!channel) return interaction.reply({ content: "Failed to create generator channel. Please Try again.", ephemeral: true }).catch(console.error);

            await tempvcGeneratorsSchema.create( // Save in the db.
            { 
                category_id: category.id, 
                guild_id: interaction.guild?.id,
                generator_id: channel.id,
                vc_user_limit: null, 
                region: null, 
                allow_rename: false, 
                custom_vc_name: null
            });
            interaction.client.tempvcGenerators.add(interaction.guild?.id + channel.id);
            
            const generatorSettingsEmbed = new EmbedBuilder()
            .setAuthor({ name: 'Aurora Bot', iconURL: interaction.client!.user!.avatarURL()! })
            .setThumbnail(interaction.guild?.iconURL()!)
            .setColor(config.embeds.colors.main as ColorResolvable)
            .setDescription(`Temporary voice channel generator successfully created. Now users can join <#${channel.id}> to create temporary voice channels.\n\n**Settings:**`)
            .setFields(
                { name: 'Category', value: category.name || 'No name' },
                { name: 'Limit', value: "Not Specified", inline: true },
                { name: 'Region', value: "Automatic", inline: true },
                { name: 'Custom name', value: "Not Specified" , inline: true },
                { name: 'Allow Renaming', value: "✖", inline: true }
            )

            interaction.reply({ embeds: [generatorSettingsEmbed], ephemeral: true }).catch(console.error);
        } catch (err) {
            console.error(err);
            interaction.reply({ content: "An Error ocurred while creating the generator channel. Please Try again.", ephemeral: true }).catch(console.error);
        }
    }
}