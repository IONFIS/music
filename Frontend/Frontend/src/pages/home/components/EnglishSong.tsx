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

const EnglishSong: React.FC<Props> = ({ title, query }) => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  const playSong = useMusicStore((state) => state.playSong);
  const setSongsInStore = useMusicStore((state) => state.setSongs);
  const cacheSongs = useMusicStore((state) => state.cacheSongs);
  const getSongs = useMusicStore((state) => state.getSongs);
  const setQueue = useMusicStore((state) => state.setQueue);

  useEffect(() => {
    const cachedSongs = getSongs(query);
    if (cachedSongs?.length) {
      setSongs(cachedSongs);
      return;
    }

    const fetchSongs = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `https://saavn.dev/api/search/songs?query=${query}&limit=30`
        );
        if (!response.ok) throw new Error(`Server error: ${response.status}`);

        const data = await response.json();
        const formattedSongs: Song[] = data?.data?.results?.map((song: any) => ({
          id: song.id,
          name: song.name,
          url: song.downloadUrl?.[4]?.url || "",
          artist: song?.artists?.primary?.[0]?.name || "Unknown Artist",
          image: song.image?.[1]?.url || song.image?.[0]?.url || "",
        })) || [];

        setSongs(formattedSongs);
        setSongsInStore(formattedSongs);
        cacheSongs(query, formattedSongs);
      } catch (err) {
        setError((err as Error).message || "Failed to fetch songs.");
      } finally {
        setLoading(false);
      }
    };

    fetchSongs();
  }, [query, cacheSongs, getSongs, setSongsInStore]);

  const handlePlayClick = (song: Song) => {
    playSong(song);
    setQueue(songs); // Matches FeaturedSong's play logic
  };

  const handleDownload = async (song: Song) => {
    try {
      const response = await fetch(song.url);
      if (!response.ok) throw new Error("Failed to download song.");
      
      const blob = await response.blob();
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${song.name}.mp3`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Download error:", err);
    }
  };

  const toggleMenu = (id: string) => {
    setMenuOpen(menuOpen === id ? null : id);
  };

  if (loading) return <p className="text-center mt-4">Loading songs...</p>;
  if (error) return <p className="text-red-500 text-center mt-4">{error}</p>;

  return (
    <div className="container mx-auto p-4 text-white">
      <h1 className="text-2xl font-bold text-start mb-6">{title}</h1>

      <div className="overflow-x-auto scrollbar-hide">
        <div className="grid grid-cols-5 bg-black gap-3 w-max">
          {songs.length > 0 ? (
            songs.map((song) => (
              <div
                key={song.id}
                className="w-screen sm:w-[30vw] h-[10vh] flex items-center rounded-lg shadow-md relative p-2"
              >
                <img
                  src={song.image}
                  alt={song.name}
                  className="w-15 h-10 object-cover rounded-md"
                />
                <div className="ml-4 flex flex-col justify-center flex-grow truncate">
                  <div className="flex justify-between items-center w-full">
                    <h2 className="text-md font-semibold truncate">{song.name}</h2>
                    <button
                      onClick={() => toggleMenu(song.id)}
                      className="text-white text-xl focus:outline-none"
                    >
                      ⋮
                    </button>
                  </div>
                  <p className="text-gray-400 text-sm">{song.artist}</p>
                </div>

                {menuOpen === song.id && (
                  <div className="absolute top-full right-0 mt-2 w-32 bg-gray-800 rounded-lg shadow-lg z-50">
                    <button
                      onClick={() => handlePlayClick(song)}
                      className="block w-full text-left px-4 py-2 text-white hover:bg-gray-700"
                    >
                      Play
                    </button>
                    <button
                      onClick={() => handleDownload(song)}
                      className="block w-full text-left px-4 py-2 text-white hover:bg-gray-700"
                    >
                      Download
                    </button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 col-span-5">No songs found.</p>
          )}
        </div>
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default React.memo(EnglishSong);
