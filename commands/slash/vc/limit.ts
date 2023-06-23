import { CacheType, ChatInputCommandInteraction, GuildMember, VoiceChannel } from "discord.js";
import tempvcScheema from "../../../scheemas/tempvcScheema";

export default {
    subCommand: 'vc.limit',
    callback: async (interaction: ChatInputCommandInteraction<CacheType>) =>{
        const member = interaction.member! as GuildMember;
        const newLimit = interaction.options.getInteger('max', true);

        // Check if the user is in a voice channel
        if (!member.voice.channel) return interaction.reply({ content: 'You must be in a voice channel to use this command.', ephemeral: true });

        // Check if the user is the owner of the voice channel.
        tempvcScheema.findOne({ owner_id: member.id, guild_id: interaction.guildId }).then(async (vc) => {
            if (!vc) {
                return await interaction.reply({ content: 'You are not the owner of this voice channel.', ephemeral: true });
            }

            // Get the users voice channel.
            const channel = interaction.guild!.channels.cache.get(vc.vc_id) as VoiceChannel;
            if (!channel) {
                return await interaction.reply({ content: 'An error occured while trying to find your voice channel. Please try again.', ephemeral: true });
            }

            // Change vc name.
            const prevUserLimit = channel.userLimit;
            await channel.setUserLimit(newLimit);

            await interaction.reply({ content: `Your voice channe\'s user limit has been changed from ${prevUserLimit} to ${newLimit}`, ephemeral: true });
        }).catch(async (err) => {
            console.error(err);
            interaction.reply({ content: 'An error occured while trying to change the user limit in this channel. Please try again.', ephemeral: true });
        });
    }
}