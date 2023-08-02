import { Client } from "discord.js";
import getFiles from "../util/get-files";

const setupModals = (client: Client) => {
    // Get all Commands and determine the type.
    getFiles('./modals', '.ts', 'MODALS').forEach((modalFile) => {
        const modal = require(`${modalFile}`).default;
        if (!modal) return;

        client.modals.set(modal.name, modal);
    });
}

export default setupModals;