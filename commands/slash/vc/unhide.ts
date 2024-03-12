import { CacheType, ChatInputCommandInteraction, GuildMember, VoiceChannel } from "discord.js";
import tempvcScheema from "../../../schemas/tempvcSchema";

export default {
    subCommand: 'vc.unhide',
    callback: async (interaction: ChatInputCommandInteraction<CacheType>) =>{
        const member = interaction.member! as GuildMember;

        // Check if the user is in a voice channel
        if (!member.voice.channel) {
            return await interaction.reply({ content: 'You must be in a voice channel to use this command.', ephemeral: true });
        }

        // Check if the user is the owner of the voice channel.
        const vc = await tempvcScheema.findOne({ owner_id: member.id, guild_id: interaction.guildId });
        if (!vc) {
            return await interaction.reply({ content: 'You are not the owner of this voice channel.', ephemeral: true });
        }

        // Get the users voice channel
        const channel = interaction.guild!.channels.cache.get(vc.vc_id) as VoiceChannel;
        if (!channel) {
            return await interaction.reply({ content: 'An error occured while trying to find your voice channel. Please try again.', ephemeral: true });
        }

        // Deny ViewChannel permission for @everyone role
        channel.edit({ name: `${vc.name}`}).catch(console.error);
        await channel.permissionOverwrites.create(interaction.guild?.roles.everyone!, {
            ViewChannel: true
        });

        await interaction.reply({ content: 'Your voice channel has been revealed to @everyone!', ephemeral: true });
    }
}