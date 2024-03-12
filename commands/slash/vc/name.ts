import { CacheType, ChatInputCommandInteraction, Collection, GuildMember, VoiceChannel } from "discord.js";
import tempvcScheema from "../../../schemas/tempvcSchema";
import tempvcGeneratorsScheema from "../../../schemas/tempvcGeneratorsSchema";
import { canRenameChannel } from "../../../util/herper-functions";

export default {
    subCommand: 'vc.name',
    callback: async (interaction: ChatInputCommandInteraction<CacheType>) =>{
        const member = interaction.member! as GuildMember;
        const newName = interaction.options.getString('custom_name', true);

        // Check if the user is in a voice channel
        if (!member.voice.channel) return interaction.reply({ content: 'You must be in a voice channel to use this command.', ephemeral: true });
        
        // Check if the user is the owner of the voice channel.
        const vc = await tempvcScheema.findOne({ owner_id: member.id, guild_id: interaction.guildId });
        
        if (!vc) {
            return await interaction.reply({ content: 'You are not the owner of this voice channel.', ephemeral: true });
        }
        
        // Check if the names for generated vcs can be changed.
        const generator = await tempvcGeneratorsScheema.findOne({ generator_id: vc?.generator_id });
        
        if (generator && !generator.allow_rename) {
            return await interaction.reply({ content: 'You are not allowed to change the name of this voice channel.', ephemeral: true });
        }
        
        // Get the users voice channel.
        const channel = interaction.guild!.channels.cache.get(vc.vc_id) as VoiceChannel;
        if (!channel) {
            return await interaction.reply({ content: 'An error occured while trying to find your voice channel. Please try again.', ephemeral: true });
        }
        
        const { canRename, message } = canRenameChannel(channel.id, interaction.client);
        if (!canRename) {
            return await interaction.reply({ content: message, ephemeral: true });
        }
        
        // Change vc name.
        // let newChannelName = newName;
        // if (channel.name.startsWith('Hidden | ')) {
            //     newChannelName = `Hidden | ${newName}`;
        // }
        await Promise.all([
            channel.setName(newName),
            vc.updateOne({ name: newName })
        ]);

        await interaction.reply({ content: 'Your voice channe\'s name has been changed', ephemeral: true });
    }
}