import { useEffect, useState } from "react";

export default function HomePage() {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAlbums = async () => {
      try {
        const response = await fetch(
          "https://saavn.dev/api/search/albums?query=long&limit=20"
        );
        if (!response.ok) throw new Error(`Server error: ${response.status}`);

        const data = await response.json();
        console.log("Fetched Albums:", data);

        if (data?.data?.results && Array.isArray(data.data.results)) {
          setAlbums(data.data.results);
        } else {
          setAlbums([]);
        }
      } catch (err) {
        setError(err.message || "An unknown error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchAlbums();
  }, []);

  if (loading) return <p className="text-center mt-4">Loading albums...</p>;
  if (error) return <p className="text-red-500 text-center mt-4">{error}</p>;

  return (
    <div className="container mx-auto p-4 text-white">
      <h1 className="text-2xl font-bold text-center mb-4">Albums</h1>

      <div className="overflow-x-auto">
        <div className="grid grid-cols-5 bg-black gap-3 space-x-5 w-max">
          {albums.length > 0 ? (
            albums.map((album) => (
              <div
                key={album.id}
                className="w-screen sm:w-[30vw] h-[15vh] flex items-center rounded-lg shadow-md"
              >
                {/* Album Cover */}
                <img
                  src={album.image?.[1]?.url || album.image?.[0]?.url}
                  alt={album.name}
                  className="w-20 h-20 object-cover rounded-md"
                />

                {/* Album Details */}
                <div className="ml-4">
                  <h2 className="text-md font-semibold truncate">{album.name}</h2>
                  <p className="text-gray-400 text-sm">
                    {album.language} | {album.year}
                  </p>
                  <a
                    href={album.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 text-sm mt-2 block"
                  >
                    View Album
                  </a>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 col-span-4">No albums found.</p>
          )}
        </div>
      </div>
    </div>
  );
}
