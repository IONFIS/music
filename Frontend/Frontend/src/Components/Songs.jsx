import { useEffect, useState, useRef } from "react";

export default function HomPage() {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("punjabi"); // Default search term
  const [debouncedSearch, setDebouncedSearch] = useState("punjabi"); // Debounced term
  const [currentSongUrl, setCurrentSongUrl] = useState("");
  
  const audioRef = useRef(null); // Ref to store the audio player

  // Debounce effect: Updates `debouncedSearch` after user stops typing
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500); // 500ms debounce delay

    return () => clearTimeout(handler); // Cleanup previous timeout
  }, [searchTerm]);

  // Fetch songs from API whenever `debouncedSearch` changes
  useEffect(() => {
    const fetchSongs = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `https://saavn.dev/api/search/songs?query=${debouncedSearch}&limit=30`
        );
        if (!response.ok) throw new Error(`Server error: ${response.status}`);

        const data = await response.json();
        if (data?.data?.results && Array.isArray(data.data.results)) {
          setSongs(data.data.results);
        } else {
          setSongs([]);
        }
      } catch (err) {
        setError(err.message || "An unknown error occurred");
      } finally {
        setLoading(false);
      }
    };

    if (debouncedSearch.trim() !== "") {
      fetchSongs();
    }
  }, [debouncedSearch]);

  // Play song
  const handlePlayClick = (url) => {
    if (audioRef.current) {
      audioRef.current.pause(); // Pause the currently playing song
      audioRef.current.src = url; // Set new song URL
      audioRef.current.load();
      audioRef.current.play(); // Play new song
    } else {
      setCurrentSongUrl(url);
    }
  };

  const handleDownload = async (downloadUrls, songName) => {
    if (!downloadUrls || downloadUrls.length < 3) {
      alert("Download link not available!");
      return;
    }

    const mediumQualityUrl = downloadUrls[2]?.url; // Use 128kbps quality

    if (!mediumQualityUrl) {
      alert("Medium-quality download link not available!");
      return;
    }

    try {
      const response = await fetch(mediumQualityUrl, { mode: "cors" }); // Fetch the file
      if (!response.ok) throw new Error("Failed to fetch file");

      const blob = await response.blob(); // Convert response to Blob
      const objectUrl = URL.createObjectURL(blob); // Create object URL

      const anchor = document.createElement("a");
      anchor.href = objectUrl;
      anchor.download = `${songName}.mp3`; // Set filename as .mp3
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);

      URL.revokeObjectURL(objectUrl); // Clean up memory
    } catch (error) {
      console.error("Download error:", error);
      alert("Error downloading the song. Try again!");
    }
  };

  return (
    <div className="container mx-auto p-4 text-white">
      <h1 className="text-2xl font-bold text-center mb-4">Music Player</h1>

      {/* Search Bar with Debouncing */}
      <div className="mb-4 text-center">
        <input
          type="text"
          placeholder="Search for a song..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-1/2 px-4 py-2 text-black rounded-md focus:outline-none"
        />
      </div>

      {/* Loading State */}
      {loading && <p className="text-center text-gray-400">Loading songs...</p>}

      {/* Song List */}
      <div className="flex gap-4 bg-black overflow-x-auto overflow-y-hidden whitespace-nowrap p-4">
        {songs.length > 0 ? (
          songs.map((song) => (
            <div
              key={song.id}
              className="w-48 h-80 min-w-[120px] p-2 rounded-lg shadow-md relative group flex-shrink-0"
            >
              {/* Song Image */}
              <div className="relative">
                <img
                  src={song.image?.[1]?.url || song.image?.[0]?.url}
                  alt={song.name}
                  className="w-48 h-48 object-cover rounded-md"
                />
                <button
                  onClick={() => handlePlayClick(song.downloadUrl?.[4]?.url)}
                  className="absolute inset-0 flex items-center justify-center bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <img src="./play-button.svg" alt="Play" className="w-10 h-10" />
                </button>
              </div>

              {/* Song Details */}
              <h2 className="text-md font-semibold mt-2 truncate">{song.name}</h2>
              <p className="text-gray-400 text-sm">{song.language} | {song.year}</p>

              {/* Artists */}
              <div className="mt-1">
                <ul className="text-sm text-gray-300 truncate">
                  {song.artists?.primary.map((artist) => (
                    <li key={artist.id} className="truncate">
                      <a href={artist.url} target="_blank" rel="noopener noreferrer">
                        {artist.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Download Button */}
              <button
                onClick={() => handleDownload(song.downloadUrl, song.name)}
                className="mt-2 w-full bg-blue-500 text-white py-1 rounded-md hover:bg-blue-700 transition"
              >
                Download (128kbps)
              </button>
            </div>
          ))
        ) : (
          !loading && <p className="text-center text-gray-500">No songs found.</p>
        )}
      </div>

      {/* Audio Player */}
      <audio ref={audioRef} controls autoPlay className="w-full hidden">
        <source src={currentSongUrl} type="audio/mp4" />
        Your browser does not support the audio element.
      </audio>
    </div>
  );
}
