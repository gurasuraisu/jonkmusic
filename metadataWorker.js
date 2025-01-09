// metadataWorker.js
importScripts('https://cdnjs.cloudflare.com/ajax/libs/jsmediatags/3.9.5/jsmediatags.min.js');

self.onmessage = async function(e) {
    const { file, id } = e.data;
    
    try {
        const metadata = await extractMetadata(file);
        self.postMessage({
            success: true,
            id: id,
            metadata: metadata
        });
    } catch (error) {
        self.postMessage({
            success: false,
            id: id,
            error: error.message
        });
    }
};

function extractMetadata(file) {
    return new Promise((resolve, reject) => {
        new jsmediatags.Reader(file)
            .setTagsToRead(['title', 'artist', 'album', 'year', 'picture', 'track'])
            .read({
                onSuccess: async function(tag) {
                    let albumArt = null;
                    
                    if (tag.tags.picture) {
                        const { data, format } = tag.tags.picture;
                        const base64String = data.reduce((acc, curr) => acc + String.fromCharCode(curr), '');
                        albumArt = `data:${format};base64,${btoa(base64String)}`;
                    }
                    
                    resolve({
                        title: tag.tags.title || file.name.replace(/\.[^/.]+$/, ""),
                        artist: tag.tags.artist || 'Unknown Artist',
                        album: tag.tags.album || 'Unknown Album',
                        year: tag.tags.year || '',
                        albumArt: albumArt,
                        trackNumber: tag.tags.track ? parseInt(tag.tags.track) : null
                    });
                },
                onError: reject
            });
    });
}
