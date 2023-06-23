import { CacheType, ChannelType, ChatInputCommandInteraction, ColorResolvable, EmbedBuilder } from "discord.js"
import config from "../../../config.json";
import tempvcGeneratorScheema from "../../../scheemas/tempvcGeneratorsScheema";

export default {
    subCommand: 'tempvc.create',
    callback: async (interaction: ChatInputCommandInteraction<CacheType>) => {
        // Get settings from the command.
        const category = interaction.options.getChannel('category');
        const limit = interaction.options.getInteger('limit');
        const region = interaction.options.getString('region');
        const name = interaction.options.getString('custom_name');
        const allowRename = interaction.options.getBoolean('allow_renaming') || false;

        // Create the generator channel in the corresponding category.
        interaction.guild?.channels.create({ 
            name: "➕ VC Generator",
            type: ChannelType.GuildVoice,
            parent: category?.id,
        }).then(async (channel) => {
            await channel.setRTCRegion(region);
            
            try {
                await tempvcGeneratorScheema.create( // Save in the db.
                    { 
                        category_id: category?.id, 
                        guild_id: interaction.guild?.id,
                        generator_id: channel.id,
                        vc_user_limit: limit, 
                        region: region, 
                        allow_rename: allowRename, 
                        custom_vc_name: name
                    }
                );
            } catch {
                await interaction.reply({ content: "An Error ocurred while creating the generator channel. Please Try again.", ephemeral: true });
                channel.delete().catch((err) => console.error('Unnable to delete voice channel: ', err));
                return;
            }

            const allowRenameString = allowRename ? "✔" : "✖"
            const generatorSettingsEmbed = new EmbedBuilder()
                .setAuthor({ name: 'Aurora Bot', iconURL: interaction.client!.user!.avatarURL()! })
                .setThumbnail(interaction.guild?.iconURL()!)
                .setColor(config.embeds.colors.main as ColorResolvable)
                .setDescription(`Temporary voice channel generator successfully created. Now users can join <#${channel.id}> to create temporary voice channels.\n\n**Settings:**`)
                .setFields(
                    { name: 'Category', value: category?.name || 'No name' },
                    { name: 'Limit', value: limit?.toString() || 'Not specified', inline: true},
                    { name: 'Region', value: region || 'Not specified', inline: true },
                    { name: 'Custom name', value: name || 'Not Specified', inline: true},
                    { name: 'Allow Renaming', value: allowRenameString, inline: true }
                )
            interaction.client.tempvcGenerators.add(interaction.guild?.id + channel.id);
            await interaction.reply({ embeds: [generatorSettingsEmbed], ephemeral: true });
        }).catch(async (err) => {
            console.log(err);
            await interaction.reply({ content: "An Error ocurred while creating the generator channel. Please Try again.", ephemeral: true });
        });
    }
}