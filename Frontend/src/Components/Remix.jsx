import { useEffect, useState } from "react";

export default function Remix() {
  const [songs, setSongs] = useState([]); // songs is an array by default
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentSongUrl, setCurrentSongUrl] = useState(""); // State to store the current song's URL

  useEffect(() => {
    const fetchSongs = async () => {
      try {
        const response = await fetch(
          "https://saavn.dev/api/search/songs?query=remixhindi&limit=20"
        );
        if (!response.ok) throw new Error(`Server error: ${response.status}`);

        const data = await response.json();

        console.log("Response Data:", data); // Debugging log to inspect the structure

        // Check if the response contains results
        if (data?.data?.results && Array.isArray(data.data.results)) {
          setSongs(data.data.results); // Set the fetched songs
        } else {
          console.log("No songs found in response");
          setSongs([]); // Set an empty array if no songs are found
        }
      } catch (err) {
        console.error("Fetch error:", err); // Log full error for debugging
        setError(err.message || "An unknown error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchSongs();
  }, []);

  const handlePlayClick = (url) => {
    setCurrentSongUrl(url); // Set the current song's URL to the state
  };

  if (loading) return <p className="text-center mt-4">Loading songs...</p>;
  if (error) return <p className="text-red-500 text-center mt-4">{error}</p>;

  return (
    <div className="container mx-auto p-4 text-white">
      <h1 className="text-2xl font-bold text-center mb-4">Music Player</h1>

      {/* Scrollable Row */}
      <div className="flex gap-4 bg-black overflow-y-hidden overflow-x-auto whitespace-nowrap p-4">
        {songs.length > 0 ? (
          songs.map((song) => (
            <div
              key={song.id}
              className="w-48 h-80 min-w-[120px]  p-2 rounded-lg shadow-md relative group flex-shrink-0"
            >
              {/* Displaying Song Image */}
              <div className="relative">
                <img
                  src={song.image?.[1]?.url || song.image?.[0]?.url}
                  alt={song.name}
                  className="w-48 h-48 object-cover rounded-md "
                />
                <button
                  onClick={() => handlePlayClick(song.downloadUrl?.[4]?.url)}
                  className="absolute inset-0 flex items-center justify-center  bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <img src="./play-button.svg" alt="Play" className="w-10 h-10" />
                </button>
              </div>

              {/* Song Name */}
              <h2 className="text-md font-semibold mt-2 truncate">{song.name}</h2>

              {/* Song Details */}
              <p className="text-gray-400 text-sm">
                {song.language} | {song.year}
              </p>

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
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500">No songs found.</p>
        )}
      </div>

      {/* Audio Player */}
      {currentSongUrl && (
        <div className="mt-4">
          <audio controls autoPlay className="w-full">
            <source src={currentSongUrl} type="audio/mp4" />
            Your browser does not support the audio element.
          </audio>
        </div>
      )}
    </div>
  );
}
