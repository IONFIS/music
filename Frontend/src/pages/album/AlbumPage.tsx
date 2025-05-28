import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ScrollArea } from "@/Components/ui/scroll-area";
import { useMusicStore } from "@/stores/musicStore";
import { Play } from "lucide-react";


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

  useEffect(() => {
    const fetchAlbumDetails = async () => {
      try {
        const response = await fetch(`https://saavn.dev/api/albums?id=${albumId}`);
        if (!response.ok) throw new Error(`Server error: ${response.status}`);

        const data = await response.json();
        setAlbum(data?.data || null);

        const songs = data?.data?.songs.map((song: any) => ({
          id: song.id,
          name: song.name,
          url: song.downloadUrl?.[4]?.url || song.downloadUrl?.[0]?.url,
          artist: song.primaryArtists,
          image: song.image?.[1]?.url || song.image?.[0]?.url || "",
        }));

        setSongs(songs);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred");
      } finally {
        setLoading(false);
      }
    };

    if (albumId) fetchAlbumDetails();
  }, [albumId, setSongs]);

  const handlePlayClick = (song: Song) => {
    const downloadUrl = song.downloadUrl?.[4]?.url || song.downloadUrl?.[0]?.url;
    if (!downloadUrl) {
      alert("Song URL not available");
      return;
    }

    const songData = {
      id: song.id,
      name: song.name,
      url: downloadUrl,
      artist: song.primaryArtists,
      image: song.image?.[1]?.url || song.image?.[0]?.url || "",
    };

    playSong(songData);
    if (!queue.some((qSong) => qSong.id === song.id)) {
      addToQueue(songData);
    }
  };

  if (error) {
    return <p className="text-center text-red-500">{error}</p>;
  }

  return (
    <div className="h-full flex flex-col gap-4 p-4">
      {loading ? (
        <p className="text-white">Loading album...</p>
      ) : album ? (
        <>
          <div className="flex items-center gap-4 rounded-md bg-gradient-to-b from-[#5038a0]/80 via-zinc-900/80 to-zinc-900 p-4 animate-pulse">
            <img
              src={album.image?.[1]?.url || album.image?.[0]?.url}
              alt={album.name}
              className="size-32 rounded-md object-cover"
            />
            <div>
              <h1 className="text-3xl font-bold text-white">{album.name}</h1>
              <p className="text-zinc-400">{album.songs.length} Songs</p>
              {currentSong && (
                <h2 className="text-xl font-bold text-white">
                  Currently Playing: {currentSong.name}
                </h2>
              )}
            </div>
          </div>

          <ScrollArea className="h-[calc(100vh-300px)] w-full border rounded-md p-4">
            {album.songs.map((song) => (
              <div
                key={song.id}
                className="p-2 rounded-md flex items-center gap-3 hover:bg-zinc-800 cursor-pointer group"
              >
                <img
                  src={song.image?.[1]?.url || song.image?.[0]?.url}
                  alt={song.name}
                  className="size-12 rounded-md object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">{song.name}</p>
                  <p className="text-sm text-zinc-400">{song.primaryArtists}</p>
                </div>
                <p className="text-sm text-zinc-400">{formatDuration(song.duration)}</p>

                <button
                  onClick={() => handlePlayClick(song)}
                  className="hidden group-hover:block text-white bg-purple-600 p-2 rounded-md hover:bg-purple-800 transition"
                >
                  <Play className="size-5" />
                </button>
              </div>
            ))}
          </ScrollArea>
        </>
      ) : (
        <p className="text-white">Album not found</p>
      )}
      
      
    </div>
  );
};

export default AlbumPage;
