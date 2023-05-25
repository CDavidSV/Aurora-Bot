import { Client, Events } from "discord.js";
import mongoose from "mongoose";
import dynamicStatus from "../handlers/dynamic-status-handler";

export default {
    name: Events.ClientReady,
    once: true,
    async execute(client: Client) {
        //await mongoose.connect(process.env.MONGO_URI!).then(() => { // Connect to mongo, url needs to be provided in a .env file.
        //    console.log('Connected to mongo'.green);
        //});
        console.log(`Logged in as ${client.user!.tag}`.green);

        // On bot ready.
        client.startTime = new Date().getTime();
        dynamicStatus.run(client);
    }
};
