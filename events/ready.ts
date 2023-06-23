import { Client, Events } from "discord.js";
import mongoose from "mongoose";
import dynamicStatus from "../handlers/dynamic-status-handler";
import tempvcScheema from "../scheemas/tempvcScheema";
import tempvcGeneratorsScheema from "../scheemas/tempvcGeneratorsScheema";

export default {
    name: Events.ClientReady,
    once: true,
    async execute(client: Client) {
        await mongoose.connect(process.env.MONGO_URI!).then(() => { // Connect to mongo, url needs to be provided in a .env file.
            console.log('Connected to mongo'.green);

            // Get temp vc generators and voice channels.
            tempvcGeneratorsScheema.find().then((generators) => {
                if (generators.length >= 1) {
                    generators.forEach((generator) => {
                        client.tempvcGenerators.add(generator.guild_id + generator.generator_id);
                    });
                }
            });
            tempvcScheema.find().then((voiceChannels) => {
                if (voiceChannels.length >= 1) {
                    voiceChannels.forEach((voiceChannel) => {
                        client.tempvChannels.add(voiceChannel.guild_id + voiceChannel.vc_id);
                    });
                }
            });
        });

        console.log(`Logged in as ${client.user!.tag}`.green);

        // On bot ready.
        client.startTime = new Date().getTime();
        dynamicStatus.run(client);
    }
};
