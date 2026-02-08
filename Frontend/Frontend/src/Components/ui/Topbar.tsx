// import { SignedOut,  UserButton } from '@clerk/clerk-react';
// import { LayoutDashboardIcon } from 'lucide-react';

// import { Link } from 'react-router-dom';
// import SignInAuthButton from './SignInAuthButton';
// import { useAuthStore } from '@/stores/useAuthStore';
// import { cn } from '@/lib/utils';
// import { buttonVariants } from './button';

// const Topbar = () => {
//     const{ isAdmin} =useAuthStore();
// console.log({isAdmin});
//   return (
//   <div className='flex items-center justify-between p-4 sticky top-0 bg-zinc-900/75 backdrop-blur-md z-10 rounded-md'>
//     <div className=' flex gap-2 items-center'> 
//       <img src="/musical-note.svg"  />
//      BeatHive
//       </div>
//     <div className=' flex gap-4 items-center'>
//         {isAdmin && (
//             <Link to ={"/admin"}
//             className={cn(buttonVariants({variant:"outline"}))}>
//                 <LayoutDashboardIcon className='size-4 mr-2'/>
//                 Admin Dashboard
//             </Link>
//         )}

//         <SignedOut>
//             <SignInAuthButton />
//         </SignedOut>
    
//         <UserButton/>
//     </div>
//   </div>
//   )
// }

// export default Topbar
// TopbarWithSearch.tsx
import { useEffect, useRef, useState } from "react";
import { Search, X, Trash2 } from "lucide-react";
import { useMusicStore } from "@/stores/musicStore";

interface Song {
  id: string;
  name: string;
  url: string;
  artist: string;
  image: string;
}

const RECENT_KEY = "recentSearches";

const Topbar = () => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [songs, setSongs] = useState<Song[]>([]);
  const [recentSongs, setRecentSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const playSong = useMusicStore((state) => state.playSong);
  const setQueue = useMusicStore((state) => state.setQueue);

  useEffect(() => {
    if (searchOpen) {
      document.body.style.overflow = "hidden";
      inputRef.current?.focus();
      const stored = localStorage.getItem(RECENT_KEY);
      if (stored) setRecentSongs(JSON.parse(stored));
    } else {
      document.body.style.overflow = "unset";
    }
  }, [searchOpen]);

  useEffect(() => {
    const fetchSongs = async () => {
      if (query.trim().length < 2) {
        setSongs([]);
        return;
      }
      setLoading(true);
      try {
        const res = await fetch(`https://saavn.dev/api/search/songs?query=${query}&limit=10`);
        const data = await res.json();
        const parsed: Song[] = data?.data?.results?.map((song: any) => ({
          id: song.id,
          name: song.name,
          url: song.downloadUrl?.[4]?.url,
          artist: song?.artists?.primary?.[0]?.name || "Unknown Artist",
          image: song.image?.[1]?.url || song.image?.[0]?.url || "",
        })) || [];
        setSongs(parsed);
      } catch (err) {
        console.error("Error searching songs:", err);
      } finally {
        setLoading(false);
      }
    };

    const timeout = setTimeout(fetchSongs, 300);
    return () => clearTimeout(timeout);
  }, [query]);

  const saveToRecent = (song: Song) => {
    const updated = [song, ...recentSongs.filter((s) => s.id !== song.id)].slice(0, 8);
    setRecentSongs(updated);
    localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
  };

  const clearRecent = () => {
    setRecentSongs([]);
    localStorage.removeItem(RECENT_KEY);
  };

  const handlePlayClick = (song: Song) => {
    playSong(song);
    setQueue([song, ...songs]);
    saveToRecent(song);
    setSearchOpen(false);
    setQuery("");
  };

  const handleEnterSearch = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && query.trim().length > 1) {
      window.location.href = `/search?q=${encodeURIComponent(query.trim())}`;
    }
  };

  return (
    <>
      <div className="sticky top-0 z-40 bg-gradient-to-r from-black via-zinc-900 to-black px-6 py-3 shadow-md backdrop-blur-md">
        <div className="flex items-center justify-between w-full max-w-6xl mx-auto">
          <div className="flex items-center gap-2">
            <img src="/musical-note.svg" alt="Logo" className="w-7 h-7" />
            <h1 className="text-white font-bold text-lg">Beat Hive</h1>
          </div>
          <button
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-1 text-white hover:text-pink-400 transition"
          >
            <Search size={22} />
            <span className="hidden sm:inline text-sm">Search</span>
          </button>
        </div>
      </div>

      {searchOpen && (
        <div className="fixed inset-0 z-50 bg-zinc-950 bg-opacity-95 p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Search Songs</h2>
            <button
              onClick={() => {
                setSearchOpen(false);
                setQuery("");
              }}
              className="text-white hover:text-red-400 transition"
            >
              <X size={28} />
            </button>
          </div>

          <div className="flex items-center bg-zinc-800 text-white rounded-full px-4 py-2 mb-4">
            <Search size={22} className="mr-2 text-pink-400" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search for songs..."
              className="bg-transparent outline-none w-full text-sm"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleEnterSearch}
            />
          </div>

          <div className="overflow-y-auto flex-1 scrollbar-hide space-y-4">
            {recentSongs.length > 0 && !query.trim() && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-gray-400 text-sm">Recent Searches</h4>
                  <button onClick={clearRecent} className="text-gray-400 hover:text-red-400 text-sm flex items-center gap-1">
                    <Trash2 size={14} /> Clear
                  </button>
                </div>
                {recentSongs.map((song) => (
                  <div
                    key={song.id}
                    onClick={() => handlePlayClick(song)}
                    className="flex items-center gap-4 p-2 hover:bg-zinc-800 rounded-lg cursor-pointer"
                  >
                    <img src={song.image} className="w-10 h-10 object-cover rounded" />
                    <div>
                      <p className="text-white text-sm">{song.name}</p>
                      <p className="text-gray-400 text-xs">{song.artist}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {query.trim() && (
              <div>
                <h4 className="text-gray-400 text-sm mb-2">Search Results</h4>
                {loading ? (
                  <p className="text-sm text-gray-400 text-center">Searching...</p>
                ) : songs.length > 0 ? (
                  songs.map((song) => (
                    <div
                      key={song.id}
                      onClick={() => handlePlayClick(song)}
                      className="flex items-center gap-4 p-2 hover:bg-zinc-800 rounded-lg cursor-pointer"
                    >
                      <img src={song.image} className="w-10 h-10 object-cover rounded" />
                      <div>
                        <p className="text-white text-sm">{song.name}</p>
                        <p className="text-gray-400 text-xs">{song.artist}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-400 text-center">No results found</p>
                )}
              </div>
            )}
          </div>

          <style>{`
            .scrollbar-hide::-webkit-scrollbar { display: none; }
            .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
          `}</style>
        </div>
      )}
    </>
  );
};

export default Topbar;