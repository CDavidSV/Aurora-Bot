import ytsr from "ytsr";
import Metadata from "../Classes/Metadata";

// gets metadata from search query.
export async function getMetadataFromSearchQuery(query: string) {
    let title = null;
    let thumbnail = null;
    let url = null;
    let playlist = null;
    let durationTimestamp = null;

    const search = await ytsr(query, { limit: 3 }) as any;
    let item = 0;
    let song = search.items[item];

    // In case there are no results.
    if (search.items.length < 1) return;

    // Checks if the found result is valid.
    while (search.items[item].type === 'playlist' || search.items[item].type === 'movie' && item < 2) {
        item++;
        song = search.items[item];
    }
    if (search.items[item].type === 'playlist' || search.items[item].type === 'movie') return;

    title = song.title;
    url = song.url;
    thumbnail = song.bestThumbnail.url;
    durationTimestamp = song.duration;

    return new Metadata(title, url, durationTimestamp, thumbnail, playlist);
}