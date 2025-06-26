import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useMusicStore } from "@/stores/musicStore";
import { Play, Download, Search, ArrowLeft } from "lucide-react";

interface Song {
  id: string;
  name: string;
  url: string;
  artist: string;
  image: string;
}

const SongCard = ({ song, onPlay, onDownload }: { song: Song; onPlay: () => void; onDownload: () => void }) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-zinc-800 rounded-lg p-3">
    <div className="flex items-center gap-3 overflow-hidden">
      <img src={song.image} alt={song.name} className="w-14 h-14 rounded" />
      <div className="flex-1">
        <p className="truncate font-semibold">{song.name}</p>
        <p className="text-xs text-gray-400 truncate">{song.artist}</p>
      </div>
    </div>
    <div className="flex gap-2 mt-2 sm:mt-0">
      <button onClick={onPlay} className="bg-pink-500 p-2 rounded-full">
        <Play size={16} />
      </button>
      <button onClick={onDownload} className="bg-zinc-700 p-2 rounded-full">
        <Download size={16} />
      </button>
    </div>
  </div>
);

const SearchResultsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParam = new URLSearchParams(location.search).get("q") || "";

  const [query, setQuery] = useState(queryParam);
  const [topSongs, setTopSongs] = useState<Song[]>([]);
  const [randomSongs, setRandomSongs] = useState<Song[]>([]);
  const [albums, setAlbums] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"music" | "album">("music");

  const inputRef = useRef<HTMLInputElement>(null);
  const playSong = useMusicStore((s) => s.playSong);
  const setQueue = useMusicStore((s) => s.setQueue);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (activeTab === "music") {
          const [topRes, randomRes] = await Promise.all([
            fetch(`https://saavn.dev/api/search/songs?query=${encodeURIComponent(query)}&limit=5`),
            fetch("https://saavn.dev/api/search/songs?query=songs&limit=50"),
          ]);

          const topData = await topRes.json();
          const randomData = await randomRes.json();

          const parse = (data: any) =>
            (data.data.results || []).map((s: any) => ({
              id: s.id,
              name: s.name,
              url: s.downloadUrl?.[4]?.url || "",
              artist: s.artists.primary?.[0]?.name || "Unknown",
              image: s.image?.[2]?.url || s.image?.[1]?.url || s.image?.[0]?.url || "",
            }));

          setTopSongs(parse(topData));
          setRandomSongs(parse(randomData));
        } else {
          const res = await fetch(`https://saavn.dev/api/search/albums?query=${encodeURIComponent(query)}&limit=10`);
          const data = await res.json();
          setAlbums(data.data.results || []);
        }
      } catch (e) {
        console.error("Fetch error:", e);
      } finally {
        setLoading(false);
      }
    };

    if (query.trim().length >= 2) {
      fetchData();
    } else {
      setTopSongs([]);
      setRandomSongs([]);
      setAlbums([]);
      setLoading(false);
    }
  }, [query, activeTab]);

  const onQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    navigate(`/search?q=${encodeURIComponent(val)}`);
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

  const play = (s: Song) => {
    playSong(s);
    setQueue([s, ...randomSongs]);
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-black via-zinc-900 to-black text-white overflow-hidden">
      {/* Header */}
      <div className="sticky top-0 bg-black/80 backdrop-blur px-4 py-3 shadow-md z-20">
        <div className="flex items-center mb-3">
          <button onClick={() => navigate(-1)} className="mr-3 text-white hover:text-pink-400">
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center bg-zinc-800 rounded-full p-2 flex-1">
            <Search className="text-pink-400 mr-2" size={18} />
            <input
              ref={inputRef}
              value={query}
              onChange={onQueryChange}
              placeholder="Search for music..."
              className="bg-transparent outline-none w-full text-sm"
            />
          </div>
        </div>

        <div className="flex justify-center relative mt-2">
          <button
            className={`px-4 pb-2 font-semibold ${activeTab === "music" ? "text-pink-500" : "text-gray-400"}`}
            onClick={() => setActiveTab("music")}
          >
            Music
          </button>
          <button
            className={`px-4 pb-2 font-semibold ${activeTab === "album" ? "text-pink-500" : "text-gray-400"}`}
            onClick={() => setActiveTab("album")}
          >
            Albums
          </button>
          <div
            className={`absolute bottom-0 h-[2px] w-16 bg-pink-500 transition-all duration-300 ${
              activeTab === "music" ? "left-[calc(50%-72px)]" : "left-[calc(50%+8px)]"
            }`}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-24 px-4 no-scrollbar">
        {loading ? (
          <div className="flex justify-center mt-20">
            <div className="h-10 w-10 border-4 border-pink-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : activeTab === "music" ? (
          <>
            {/* Top Results */}
            <section className="mt-6">
              <h2 className="font-semibold mb-3">Top Results</h2>
              <div className="flex flex-col gap-2">
                {topSongs.map((s) => (
                  <SongCard
                    key={s.id}
                    song={s}
                    onPlay={() => play(s)}
                    onDownload={() => handleDownload(s)}
                  />
                ))}
              </div>
            </section>

            {/* Hindi Songs */}
            <section className="mt-8">
              <h2 className="font-semibold mb-3">Hindi Songs</h2>
              <div className="flex flex-col gap-2">
                {randomSongs.map((s) => (
                  <SongCard
                    key={s.id}
                    song={s}
                    onPlay={() => play(s)}
                    onDownload={() => handleDownload(s)}
                  />
                ))}
              </div>
            </section>
          </>
        ) : (
          <section className="mt-6">
            <h2 className="font-semibold mb-3">Albums</h2>
            <div className="grid sm:grid-cols-2 gap-2">
              {albums.map((alb) => (
                <div
                  key={alb.id}
                  onClick={() => navigate(`/album/${alb.id}`)}
                  className="flex items-center gap-3 bg-zinc-800 rounded-lg p-3 h-20 overflow-hidden cursor-pointer hover:bg-zinc-700"
                >
                  <img src={alb.image?.[1]?.url || alb.image?.[0]?.url} alt="" className="w-14 h-14 rounded" />
                  <div className="flex-1">
                    <p className="truncate font-semibold">{alb.name}</p>
                    <p className="text-xs text-gray-400 truncate">{alb.artist}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default SearchResultsPage;
