import { useEffect, useState } from "react";


type Album = {
  id: string;
  name: string;
  image: { url: string }[];
};

const PlaylistSkeleton = () => {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAlbums = async () => {
      try {
        const response = await fetch(
          "https://saavn.dev/api/search/albums?query=long&limit=7"
        );
        if (!response.ok) throw new Error(`Server error: ${response.status}`);

        const data = await response.json();
        setAlbums(data?.data?.results || []);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "An unknown error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchAlbums();
  }, []);

  if (error) {
    return <p className="text-center text-red-500">{error}</p>;
  }

  return (

      <div className="h-[300px] w-full p-4 border rounded-md">
      {loading
        ? Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="p-2 rounded-md flex items-center gap-3">
              <div className="w-12 h-12 bg-zinc-800 rounded-md flex-shrink-0 animate-pulse" />
              <div className="flex-1 min-w-0 hidden md:block space-y-2">
                <div className="h-4 bg-zinc-800 rounded animate-pulse w-3/4" />
                <div className="h-3 bg-zinc-800 rounded animate-pulse w-1/2" />
              </div>
            </div>
          ))
        : albums.map((album) => (
            <div key={album.id} className="p-2 rounded-md flex items-center gap-3">
              <img
                src={album.image?.[1]?.url || album.image?.[0]?.url}
                alt={album.name}
                className="w-12 h-12 rounded-md flex-shrink-0"
              />
              <div className="flex-1 min-w-0 hidden md:block">
                <p className="text-white font-medium truncate">{album.name}</p>
              </div>
            </div>
          ))}
       </div>
  
  );
};

export default PlaylistSkeleton;
