import getFiles from "./get-files";

export default {
    getEvents() {
        const events = [];

        // Ending suffix for file type.
        const suffix = '.ts';

        const eventFiles = getFiles('./events', suffix, 'EVENT', true);
        // Loop through all events in the eventFile array and add them to the events object. 
        for (const event of eventFiles) {
            let eventFile = require(`.${event}`);
            if (eventFile.default) eventFile = eventFile.default;

            events[eventFiles.indexOf(event)] = eventFile;
        }
    }
}