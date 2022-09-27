import { Result } from 'ytpl';

export default class Metadata {
    // Variables.
    public type: string | undefined;
    public title: string | undefined;
    public url: string | undefined;
    public durationTimestamp: string | undefined;
    public durationInSeconds: number | undefined;
    public thumbnail: string | undefined;

    // Constructor.
    constructor(type: string | undefined, title: string | undefined, url: string | undefined, durationTimestamp: string | undefined, durationInSeconds: number | undefined, thumbnail: string | undefined) {
        this.type = type
        this.title = title;
        this.url = url;
        this.durationTimestamp = durationTimestamp;
        this.durationInSeconds = durationInSeconds;
        this.thumbnail = thumbnail;
    }
}