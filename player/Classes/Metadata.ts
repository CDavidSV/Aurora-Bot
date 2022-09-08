import { Result } from 'ytpl';

export default class Metadata {
    // Variables.
    public title: string | null;
    public url: string | null;
    public durationTimestamp: string | null;
    public thumbnail: string | null;
    public playlist: Result | null;

    // Constructor.
    constructor(title: string | null, url: string | null, durationTimestamp: string | null, thumbnail: string | null, playlist: Result | null) {
        this.title = title;
        this.url = url;
        this.durationTimestamp = durationTimestamp;
        this.thumbnail = thumbnail;
        this.playlist = playlist
    }
}