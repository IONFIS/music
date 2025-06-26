import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useMusicStore } from "@/stores/musicStore";
import { Play } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";


type Song = {
  id: string;
  name: string;
  primaryArtists: string;
  duration: string;
  image?: { url: string }[];
  downloadUrl?: { url: string }[];
};

type AlbumDetails = {
  name: string;
  image: { url: string }[];
  songs: Song[];
};

const formatDuration = (seconds: string) => {
  const totalSeconds = parseInt(seconds, 10);
  const minutes = Math.floor(totalSeconds / 60);
  const remainingSeconds = totalSeconds % 60;
  return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
};

const AlbumPage = () => {
  const { albumId } = useParams<{ albumId: string }>();
  const [album, setAlbum] = useState<AlbumDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { currentSong, queue, setSongs, playSong, addToQueue } = useMusicStore();

  const navigate = useNavigate();

  useEffect(() => {
    const fetchAlbum = async () => {
      try {
        const res = await fetch(`https://saavn.dev/api/albums?id=${albumId}`);
        if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
        const data = await res.json();

        setAlbum(data?.data || null);

        const parsedSongs = data?.data?.songs.map((song: any) => ({
          id: song.id,
          name: song.name,
          url: song.downloadUrl?.[4]?.url || song.downloadUrl?.[0]?.url,
          artist: song.primaryArtists,
          image: song.image?.[1]?.url || song.image?.[0]?.url || "",
        }));

        setSongs(parsedSongs);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error occurred");
      } finally {
        setLoading(false);
      }
    };

    if (albumId) fetchAlbum();
  }, [albumId, setSongs]);

  const handlePlay = (song: Song) => {
    const url = song.downloadUrl?.[4]?.url || song.downloadUrl?.[0]?.url;
    if (!url) return alert("No playable URL available");

    const songData = {
      id: song.id,
      name: song.name,
      url,
      artist: song.primaryArtists,
      image: song.image?.[1]?.url || song.image?.[0]?.url || "",
    };

    playSong(songData);
    if (!queue.some((s) => s.id === song.id)) addToQueue(songData);
  };

  if (error) {
    return <div className="text-center text-red-500 mt-10">{error}</div>;
  }

  return (
    <div className="h-screen w-full bg-gradient-to-b from-black via-zinc-900 to-zinc-950 text-white flex flex-col px-4 py-4 overflow-hidden">
      {loading ? (
        <div className="flex justify-center items-center flex-1">
          
          <div className="h-10 w-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : album ? (
        <>
          {/* Header */}{/* Back Button */}
<button
  onClick={() => navigate(-1)} // or use `navigate('/search')` for fixed route
  className="mb-4 flex items-center gap-2 text-zinc-300 hover:text-white transition"
>
  <ArrowLeft className="w-5 h-5" />
  <span className="font-medium text-sm">Back to Search</span>
</button>

          <div className="flex flex-col sm:flex-row gap-4 items-center bg-gradient-to-r from-purple-900/70 to-zinc-800/80 p-4 rounded-xl shadow-md">
            <img
              src={album.image?.[1]?.url || album.image?.[0]?.url}
              alt={album.name}
              className="w-28 h-28 rounded-xl object-cover shadow-lg"
            />
            <div className="text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold">{album.name}</h1>
              <p className="text-sm text-zinc-400 mt-1">{album.songs.length} Songs</p>
              {currentSong && (
                <p className="text-sm mt-2">
                  <span className="text-purple-400 font-semibold">Now Playing:</span> {currentSong.name}
                </p>
              )}
            </div>
          </div>

          {/* Scrollable song list */}
          <div className="flex-1 overflow-y-auto mt-4 custom-scrollbar pr-1">
            <div className="space-y-3">
              {album.songs.map((song) => (
                <div
                  key={song.id}
                  className="flex items-center gap-3 bg-zinc-800/60 hover:bg-zinc-700 transition rounded-lg px-3 py-2 group"
                >
                  <img
                    src={song.image?.[1]?.url || song.image?.[0]?.url}
                    alt={song.name}
                    className="w-12 h-12 rounded-md object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-medium">{song.name}</p>
                    <p className="text-xs text-zinc-400 truncate">{song.primaryArtists}</p>
                  </div>
                  <p className="text-xs text-zinc-400 hidden sm:block">
                    {formatDuration(song.duration)}
                  </p>
                  <button
                    onClick={() => handlePlay(song)}
                    className="ml-2 bg-purple-600 hover:bg-purple-700 p-2 rounded-full  group-hover:block transition"
                  >
                    <Play className="w-4 h-4 text-white" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="text-center text-zinc-400 mt-20">Album not found</div>
      )}
    </div>
  );
};

export default AlbumPage;
