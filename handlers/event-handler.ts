import { Client, Collection } from "discord.js";
import getFiles from "../util/get-files";
import { client } from "..";

// Get all Events and listen.
const setupEvents = () => {
    client.subCommands = new Collection();
    
    getFiles('./events', '.ts', 'EVENTS').forEach((eventFile) => {
        const event = require(`${eventFile}`).default;
        if (!event) return;

        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args));
        } else {
            client.on(event.name, (...args) => event.execute(...args));
        }
    });
}

export default setupEvents;