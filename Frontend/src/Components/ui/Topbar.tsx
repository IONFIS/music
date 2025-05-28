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


import { useEffect, useRef, useState } from "react";
import { SignedOut, UserButton } from "@clerk/clerk-react";
import { LayoutDashboardIcon, Menu, Search, X } from "lucide-react";
import { Link } from "react-router-dom";
import SignInAuthButton from "./SignInAuthButton";
import { useAuthStore } from "@/stores/useAuthStore";
import { useMusicStore } from "@/stores/musicStore";
import { useUIStore } from "@/stores/uiStore";
import { cn } from "@/lib/utils";
import { buttonVariants } from "./button";

interface Song {
  id: string;
  name: string;
  url: string;
  artist: string;
  image: string;
}

const Topbar = () => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { isAdmin } = useAuthStore();
  const playSong = useMusicStore((state) => state.playSong);
  const setQueue = useMusicStore((state) => state.setQueue);
  const {
    mobileSidebarOpen,
    toggleMobileSidebar,
    mobileFriendsActivityOpen,
    toggleMobileFriendsActivity,
  } = useUIStore();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSearchOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, []);

  useEffect(() => {
    if (searchOpen && inputRef.current) inputRef.current.focus();
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
        const parsed: Song[] =
          data?.data?.results?.map((song: any) => ({
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

  const handlePlayClick = (song: Song) => {
    playSong(song);
    setQueue(songs);
    setSearchOpen(false);
    setQuery("");
  };

  return (
    <div className="flex items-center justify-between px-4 py-3 sticky top-0 bg-zinc-900/75 backdrop-blur-md z-50 rounded-md">
      {/* LEFT: Sidebar Hamburger */}
      <button onClick={toggleMobileSidebar} className="text-white md:hidden">
        {mobileSidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* CENTER */}
      <div
        ref={containerRef}
        className="flex items-center gap-4 relative transition-all duration-300"
      >
        {/* Logo - hide on mobile when searchOpen */}
        <img
          src="/musical-note.svg"
          alt="Logo"
          className={cn(
            "w-6 h-6 md:block transition-all",
            searchOpen ? "hidden sm:block" : "block"
          )}
        />
        <span className="hidden md:block ">Beat Hive</span>

        {/* Search Bar */}
        <div
          className={cn(
            "flex items-center sm:ml-72  text-white bg-zinc-800 transition-all duration-300 rounded-full overflow-hidden",
            searchOpen ? "w-72 pl-3 pr-2 py-1 shadow-md border" : "w-10 h-10 justify-center"
          )}
        >
          <Search
            size={24}
            onClick={() => setSearchOpen(true)}
            className={cn("text-pink-300 cursor-pointer", searchOpen ? "mr-2" : "")}
          />
          {searchOpen && (
            <input
              ref={inputRef}
              type="text"
              placeholder="Search songs..."
              className="bg-transparent outline-none text-sm w-full"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          )}
        </div>

        {/* Admin Button - hide on mobile if search is open */}
       <div className=""> {isAdmin && (
          <Link
            to="/admin"
            className={cn(
              buttonVariants({ variant: "outline" }),
              "text-sm",
              searchOpen ? "hidden sm:flex" : "flex"
            )}
          >
            <LayoutDashboardIcon className="size-4 mr-2" />
            Admin
          </Link>
        )}</div>

        {/* User / Sign In - hide on mobile if search is open */}
        <SignedOut>
          <div className={cn(searchOpen ? "hidden sm:block" : "block")}>
            <SignInAuthButton />
          </div>
        </SignedOut>
        <div className={cn(searchOpen ? "hidden sm:block" : "block")}>
          <UserButton />
        </div>

        {/* Search Results Dropdown */}
        {searchOpen && query.trim() && (
          <div className="absolute top-full mt-2 max-w-96 max-h-96 overflow-y-auto bg-zinc-800 rounded-lg shadow-lg z-50 scrollbar-hide p-2">
            {loading ? (
              <div className="p-4 text-sm text-gray-400 text-center">Searching...</div>
            ) : songs.length > 0 ? (
              songs.map((song) => (
                <div
                  key={song.id}
                  onClick={() => handlePlayClick(song)}
                  className="w-full rounded-lg mb-2 cursor-pointer group flex items-center gap-3 hover:bg-zinc-700 p-2"
                >
                  <img src={song.image} alt={song.name} className="w-12 h-12 object-cover rounded" />
                  <div className="flex-1 overflow-hidden">
                    <h3 className="text-sm font-semibold text-white truncate">{song.name}</h3>
                    <p className="text-xs text-gray-400 truncate">{song.artist}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-sm text-gray-500 text-center">No results found</div>
            )}
          </div>
        )}
      </div>

      {/* RIGHT: Friends Activity Hamburger */}
      <button onClick={toggleMobileFriendsActivity} className="text-white md:hidden">
        {mobileFriendsActivityOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Hide scrollbar styles */}
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

export default Topbar;
