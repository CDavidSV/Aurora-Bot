import ytsr from "ytsr";
import Metadata from "../Classes/SongMetadata";

// gets metadata from search query.
export async function getMetadataFromSearchQuery(query: string) {
    let type;
    let title;
    let thumbnail;
    let url;
    let durationTimestamp;
    let durationSec;

    const search = await ytsr(query, { limit: 3 }) as any;
    let song: any;

    // In case there are no results.
    if (search.items.length < 1) return;

    // Checks if the found result is valid.
    for (let item = 0; item < search.items.length; item++) {
        if (search.items[item].type !== 'playlist' && search.items[item].type !== 'movie') {
            song = search.items[item];
            break;
        }
    }
    if(!song) return;

    title = song.title;
    url = song.url;
    thumbnail = song.bestThumbnail.url;

    if(song.badges.some((badge: string) => badge.includes("LIVE"))) {
        type = 'ytlive';
        durationTimestamp = 'En Vivo';
        durationSec = 0;
    } else {
        type = 'ytvideo';
        durationTimestamp = song.duration;
        durationSec = song.durationSec;
    }

    return new Metadata(type, title, url, durationTimestamp, durationSec, thumbnail);
}