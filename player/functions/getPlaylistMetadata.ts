// Gets playlist object and its information.
import ytpl from "ytpl";
import PlaylistMetadata from "../Classes/PlaylistMetadata";

export async function getPlaylistMetadata(request: string) {
    let title;
    let thumbnail;
    let url;
    let durationSec;
    let durationTimestamp;
    let playlist;

    const playlistId = await ytpl.getPlaylistID(request);

    try {
        playlist = await ytpl(playlistId, { limit: Infinity });
    } catch {
        return;
    }

    title = playlist.title;
    url = playlist.url;
    thumbnail = playlist.bestThumbnail.url;

    durationSec = 0;
    for (let song = 0; song < playlist.items.length; song++) {
        durationSec += playlist.items[song].durationSec!;
    }

    // Get duration  readable.
    if (durationSec < 3600) {
        durationTimestamp = new Date(durationSec * 1000).toISOString().slice(14, 19);
    } else {
        durationTimestamp = new Date(durationSec * 1000).toISOString().slice(11, 19);
    }

    return new PlaylistMetadata(title, url, durationTimestamp, durationSec, thumbnail, playlist);
}