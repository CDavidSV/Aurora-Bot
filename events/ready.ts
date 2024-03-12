import { Client, Events } from "discord.js";
import dynamicStatus from "../handlers/dynamic-status-handler";

export default {
    name: Events.ClientReady,
    once: true,
    async execute(client: Client) {
        console.log(`Logged in as ${client.user!.tag}`.green);

        // On bot ready.
        client.startTime = new Date().getTime();
        dynamicStatus.run(client);
    }
};