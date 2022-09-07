import { client } from '../index';
import playercore from '../player/playercore';

client.on('voiceStateUpdate', (oldState, newState) => {

    if (oldState.channelId !== oldState.guild.members.me!.voice.channelId || !oldState.guild.members.me!.voice.channel) {
        return;
    }
    if ((oldState.channel!.members.size - 1) < 1) {
        setTimeout(() => {
            if ((oldState.channel!.members.size - 1) < 1) {
                playercore.stop(oldState.guild.id);
            }
        }, 15000);
    }
});