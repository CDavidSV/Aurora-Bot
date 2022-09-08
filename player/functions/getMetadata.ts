import ytdl from "ytdl-core";
import ytpl from "ytpl";
import Metadata from "../Classes/Metadata";

// Gets metadata for the song.
export async function getMetadata(request: string, type: string) {
    let title = null;
    let thumbnail = null;
    let url = null;
    let durationSec = null;
    let durationTimestamp = null;
    let playlist = null;
    switch (type) {
        case 'ytvideo':
            // Get video metadata.
            let info;
            try {
                info = await ytdl.getInfo(request)
            } catch {
                return;
            }
            title = info.videoDetails.title;
            url = request;
            thumbnail = info.videoDetails.thumbnails[3].url;
            durationSec = parseInt(info.videoDetails.lengthSeconds);

            if (parseInt(info.videoDetails.lengthSeconds) < 3600) {
                durationTimestamp = new Date(durationSec * 1000).toISOString().slice(14, 19);
            } else {
                durationTimestamp = new Date(durationSec * 1000).toISOString().slice(11, 19);
            }
            break;
        case 'ytplaylist':
            // Get playlist metadata.
            const playlistId = await ytpl.getPlaylistID(request)

            try {
                playlist = await ytpl(playlistId, { limit: Infinity });
            } catch {
                return;
            }

            title = playlist.title;
            url = playlist.url;
            thumbnail = playlist.bestThumbnail.url;
            durationTimestamp = playlist.items[0].duration;
            break;
    }
    return new Metadata(title, url, durationTimestamp, thumbnail, playlist);
}