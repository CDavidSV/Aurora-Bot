import { Result } from 'ytpl';

export default class Metadata {
    // Variables.
    public type: string | null;
    public title: string | null;
    public url: string | null;
    public durationTimestamp: string | null;
    public durationInSeconds: number | null;
    public thumbnail: string | null;
    public playlist: Result | null;

    // Constructor.
    constructor(type: string | null, title: string | null, url: string | null, durationTimestamp: string | null, durationInSeconds: number | null, thumbnail: string | null, playlist: Result | null) {
        this.type = type
        this.title = title;
        this.url = url;
        this.durationTimestamp = durationTimestamp;
        this.durationInSeconds = durationInSeconds;
        this.thumbnail = thumbnail;
        this.playlist = playlist
    }
}