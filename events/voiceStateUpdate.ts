import { ChannelType, Events, VoiceState, Collection } from "discord.js";
import tempvcGeneratorScheema from "../scheemas/tempvcGeneratorsScheema";
import tempvcScheema from "../scheemas/tempvcScheema";

const cooldowns = new Collection<string, number>(); // Cooldows for generating temp voice channels.

const generateTempVC = async (state: VoiceState) => {
    if (!state.client.tempvcGenerators.has(state.guild.id + state.channelId)) return; // Check if the generator channels exits.

    // Check if the user is in a timeout.
    const now = Date.now();
    if (cooldowns.has(state.member?.id!)) {
        const expirationTime = cooldowns.get(state.member?.id!)!;

        if (now < expirationTime) {
            await state.member?.user.send(`You are trying to generate voice channels too quickly. Try again **<t:${Math.round(expirationTime / 1000)}:R>**`);
            return;
        }
    }

    cooldowns.set(state.member?.id!, now + 5000);
    setTimeout(() => { 
        cooldowns.delete(state.member!.id); // reset cooldowns.
    }, 5000);
    try {
        // Get the generator settings for the one the user joined and create a temporary voice channel.
        const generator = await tempvcGeneratorScheema.findOne({ guild_id: state.guild.id, generator_id: state.channelId });
        if (!generator) return;

        const count = await tempvcScheema.count({ guild_id: state.guild.id, generator_id: generator.generator_id });
        const channelName =  generator.custom_vc_name ? `${generator.custom_vc_name} ${count + 1}` : `${state.member?.displayName}'s VC`;
        
        const channel = await state.guild.channels.create({ // Apply settings from generator and save.
            name: channelName,
            type: ChannelType.GuildVoice,
            rtcRegion: generator.region,
            parent: generator.category_id,
            userLimit: generator.vc_user_limit
        });

        state.client.tempvChannels.add(state.guild.id + channel.id); // Add the channel to the tempvc set.
        await state.member?.voice.setChannel(channel).then(async () => {
            await tempvcScheema.create({ guild_id: state.guild.id, generator_id: generator.generator_id, vc_id: channel.id, owner_id: state.member?.id, name: channelName });
        }).catch(async () => { 
            await channel.delete();
            await tempvcScheema.findOneAndDelete({ guild_id: state.guild.id, vc_id: channel.id });
            state.client.tempvChannels.delete(state.guild.id + channel.id); // I case the user ca't be moved, delete the channel.
        });
    } catch (err) {
        console.error(err);
    }
}

const deleteTempVC = async (state: VoiceState) => {
    if (state.channel?.members.size! > 0 || !state.client.tempvChannels.has(state.guild.id + state.channelId)) return; // Check if the channel still has users in it and it is a temp vc.
    
    try {
        await state.channel?.delete(); // delete channel.
        await tempvcScheema.findOneAndDelete({ guild_id: state.guild.id, vc_id: state.channelId });
    } catch (err) {
        console.error(err);
    }
}

export default {
    name: Events.VoiceStateUpdate,
    once: false,
    async execute(oldState: VoiceState, newState: VoiceState) { // Handle voice states (joine, leave, move).
        if (!oldState.channelId && newState.channelId) {
            generateTempVC(newState);
        } else if (oldState.channelId && !newState.channelId) {
            deleteTempVC(oldState);
        } else if (oldState.channelId && newState.channelId) {
            deleteTempVC(oldState);
            generateTempVC(newState);
        }
    }
};