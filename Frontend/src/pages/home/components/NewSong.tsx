import React, { useEffect, useState } from "react";
import { useMusicStore } from "@/stores/musicStore";

interface Song {
  id: string;
  name: string;
  url: string;
  artist: string;
  image: string;
}

interface Props {
  title: string;
  query: string; // for fetching songs by category
}

const NewSong: React.FC<Props> = ({ title, query }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const playSong = useMusicStore((state) => state.playSong);
  const setSongsInStore = useMusicStore((state) => state.setSongs);
  const cacheSongs = useMusicStore((state) => state.cacheSongs);
  const getSongs = useMusicStore((state) => state.getSongs);
  const [songs, setSongs] = useState<Song[]>(getSongs(query) || []);
    const setQueue = useMusicStore((state) => state.setQueue);

  useEffect(() => {
    if (songs.length > 0) return; // Skip re-fetch if already cached

    const fetchSongs = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `https://saavn.sumit.co/api/search/songs?query=${query}&limit=30`
        );
        if (!response.ok) throw new Error(`Server error: ${response.status}`);

        const data = await response.json();
        const songData = data?.data?.results?.map((song: any) => ({
          id: song.id,
          name: song.name,
          url: song.downloadUrl?.[4]?.url,
          artist: song?.artists?.primary?.[0]?.name || "Unknown Artist",
          image: song.image?.[1]?.url || song.image?.[0]?.url || "",
        }));

        setSongs(songData || []);
        setSongsInStore(songData || []);
        cacheSongs(query, songData || []); // Cache the songs by query
      } catch (err) {
        setError((err as Error).message || "An unknown error occurred");
        {error && <div className="error-message">{error}</div>}
      } finally {
        setLoading(false);
      }
    };

    fetchSongs();
  }, [query, cacheSongs, getSongs, setSongsInStore, songs.length]);

 
  const handlePlayClick = (song: Song) => {
    playSong(song);
    setQueue(songs); // Matches FeaturedSong's play logic
  };

  return (
    <div className="container mx-auto p-4 text-white">
      <h2 className="text-2xl font-bold text-start mb-4">{title}</h2>

      {loading && <p className="text-center text-gray-400">Loading songs...</p>}

      <div className="flex gap-4 bg-black overflow-x-auto overflow-y-hidden whitespace-nowrap p-4 scrollbar-hide">
        {songs.length > 0 ? (
          songs.map((song) => (
            <div
              key={song.id}
              className="w-48 h-60 min-w-[120px] p-2 rounded-lg shadow-md relative group flex-shrink-0"
            >
              <div className="relative">
                <img
                  src={song.image}
                  alt={song.name}
                  className="w-48 h-48 object-cover rounded-md"
                />
                <button
                  onClick={() => handlePlayClick(song)}
                  className="absolute inset-0 flex items-center justify-center bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <img src="./play-button.svg" alt="Play" className="w-10 h-10" />
                </button>
              </div>

              <h3 className="text-md font-semibold mt-2 truncate">{song.name}</h3>
              <p className="text-gray-400 text-sm truncate">{song.artist}</p>
            </div>
          ))
        ) : (
          !loading && <p className="text-center text-gray-500">No songs found.</p>
        )}
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none; /* IE and Edge */
          scrollbar-width: none; /* Firefox */
        }
      `}</style>
    </div>
  );
};

export default React.memo(NewSong);
