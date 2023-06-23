import { CacheType, ChatInputCommandInteraction, GuildMember, VoiceChannel } from "discord.js";
import tempvcScheema from "../../../scheemas/tempvcScheema";

export default {
    subCommand: 'vc.name',
    callback: async (interaction: ChatInputCommandInteraction<CacheType>) =>{
        const member = interaction.member! as GuildMember;
        const newName = interaction.options.getString('custom_name', true);

        // Check if the user is in a voice channel
        if (!member.voice.channel) return interaction.reply({ content: 'You must be in a voice channel to use this command.', ephemeral: true });

        // Check if the user is the owner of the voice channel.
        tempvcScheema.findOneAndUpdate({ owner_id: member.id, guild_id: interaction.guildId }, { name: newName }).then(async (vc) => {
            if (!vc) {
                return await interaction.reply({ content: 'You are not the owner of this voice channel.', ephemeral: true });
            }

            // Get the users voice channel.
            const channel = interaction.guild!.channels.cache.get(vc.vc_id) as VoiceChannel;
            if (!channel) {
                return await interaction.reply({ content: 'An error occured while trying to find your voice channel. Please try again.', ephemeral: true });
            }

            // Change vc name.
            await channel.setName(newName);

            await interaction.reply({ content: 'Your voice channe\'s name has been changed', ephemeral: true });
        }).catch(async (err) => {
            console.error(err);
            interaction.reply({ content: 'An error occured while trying to rename your voice channel. Please try again.', ephemeral: true });
        });
    }
}