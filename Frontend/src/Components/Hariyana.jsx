import { useEffect, useState } from "react";

export default function HomPage() {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentSongUrl, setCurrentSongUrl] = useState("");

  useEffect(() => {
    const fetchSongs = async () => {
      try {
        const response = await fetch(
          "https://saavn.dev/api/search/songs?query=hariyanvi&limit=20"
        );
        if (!response.ok) throw new Error(`Server error: ${response.status}`);

        const data = await response.json();
        console.log("Response Data:", data);

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

    fetchSongs();
  }, []);

  const handlePlayClick = (url) => {
    setCurrentSongUrl(url);
  };

  if (loading) return <p className="text-center mt-4">Loading songs...</p>;
  if (error) return <p className="text-red-500 text-center mt-4">{error}</p>;

  return (
    <div className="container mx-auto p-4 text-white">
      <h1 className="text-2xl font-bold text-center mb-4">Music Player</h1>

      {/* Horizontal Scrollable Grid */}
      <div className="overflow-x-auto">
        <div className="grid grid-cols-5 bg-black gap-3 space-x-5 w-max ">
          {songs.length > 0 ? (
            songs.slice(0, 20).map((song) => (
              <div
                key={song.id}
                className="w-screen  sm:w-[30vw] h-[10vh] flex items-center truncate  rounded-lg shadow-md"
              >
                {/* Song Image */}
                <img
                  src={song.image?.[1]?.url || song.image?.[0]?.url}
                  alt={song.name}
                  className="w-15 px-2 h-10 object-cover rounded-md"
                />

                {/* Song Details */}
                <div className="ml-4 flex flex-col justify-center">
                 <div className="flex gap-4"> <h2 className="text-md font-semibold truncate">{song.name}</h2>
                  <p className="text-gray-400 text-sm ">
                    {song.language} | {song.year}
                  </p></div>

                  {/* Artists */}
                  <ul className="text-sm text-gray-300 flex gap-1 truncate">
                    {song.artists?.primary.map((artist) => (
                      <li key={artist.id} className="truncate ">
                        <a href={artist.url} target="_blank" rel="noopener noreferrer" className="flex">
                          {artist.name}
                        </a>
                      </li>
                    ))}
                  </ul>

                  {/* Play Button */}
                  {/* <button
                    onClick={() => handlePlayClick(song.downloadUrl?.[4]?.url)}
                    className="mt-2 text-blue-500 hover:underline"
                  >
                    Play
                  </button> */}
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 col-span-4">No songs found.</p>
          )}
        </div>
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
