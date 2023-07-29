import { Client } from "discord.js";
import getFiles from "../util/get-files";

const setupButtons = (client: Client) => {
    // Get all Commands and determine the type.
    getFiles('./message_components', '.ts', 'COMPONENTS').forEach((buttonFile) => {
        const button = require(`${buttonFile}`).default;
        if (!button) return;

        client.messageComponents.set(button.name, button);
    });
}

export default setupButtons;