import { Result } from 'ytpl';

export default class Metadata {
    // Variables.
    public title: string | undefined;
    public url: string | undefined;
    public durationTimestamp: string | undefined;
    public durationInSeconds: number | undefined;
    public thumbnail: string | null;
    public playlist: Result;

    // Constructor.
    constructor(title: string | undefined, url: string | undefined, durationTimestamp: string | undefined, durationInSeconds: number | undefined, thumbnail: string | null, playlist: Result) {
        this.title = title;
        this.url = url;
        this.durationTimestamp = durationTimestamp;
        this.durationInSeconds = durationInSeconds;
        this.thumbnail = thumbnail;
        this.playlist = playlist
    }
}