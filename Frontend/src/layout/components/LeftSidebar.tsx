
import { buttonVariants } from "@/Components/ui/button"
import { ScrollArea } from "@/Components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { SignedIn } from "@clerk/clerk-react"
import { HomeIcon, Library, MessageCircle } from "lucide-react"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"




type Album = {
    id: string;
    name: string;
    image: { url: string }[];
    language: string;
    year: string;  };
  


const LeftSidebar = () => {


    const [albums, setAlbums] = useState<Album[]>([]);
      const [loading, setLoading] = useState<boolean>(true);
      const [error, setError] = useState<string | null>(null);
    

    
      useEffect(() => {
        const fetchAlbums = async () => {
          try {
            const response = await fetch(
        'https://saavn.sumit.co/api/search/albums?query=movies&limit=100'
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
    <div className=" h-full flex flex-col gap-2 ">


    <div className=" roudned-lg bg-zinc-900 p-4">
        <div className="space-y-2">
            <Link to={"/"} className={cn(buttonVariants({
                variant:"ghost",
                className:"w-full justify-start text-white hover:bg-zinc-800",

            }))}
            >
                <HomeIcon className="mr-2 size-5"/>
                <span className="hidden md:inline"> Home</span>
                
            </Link>

            <SignedIn>
            <Link to={"/chat"} className={cn(buttonVariants({
                variant:"ghost",
                className:"w-full justify-start text-white hover:bg-zinc-800",

            }))}
            >
                <MessageCircle className="mr-2 size-5"/>
                <span className="hidden md:inline">Messages</span>
                
            </Link>

            </SignedIn>
        </div>
       </div>


       {/* library section for Album */}
       <div className=" flex-1 rounded-lg bg-zinc-900 p-4">
        <div className=" flex items-center justofy-center justify-between mb-4">
         <div className=" flex items-center text-white px-2 ">
            <Library className="mr-2 size-5"/> 
            <span className="hidden md:inline"> Playlists

            </span>
         </div>
       </div>
       <ScrollArea className="h-[calc(100vh-300px)]">
        <div className="space-y-2">  {loading
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
            <Link to={`/album/${album.id}`}  key={album.id} className="p-2  hover:bg-zinc-800 rounded-md flex items-center gap-3 group cursor-pointer">

           
                         
              <img
                src={album.image?.[1]?.url || album.image?.[0]?.url}
                alt={album.name}
                className="size-12 rounded-md flex-shrink-0  object-cover" 
              />
              <div className="flex-1 min-w-0 hidden md:block">
                <p className="font-medium truncate">
                    {album.name}

                </p>
                <p className="text-sm text-zinc-400 truncate">
                {album.language} | {album.year}

                </p>

              </div>
              
           
            </Link>
          ))}
          

        </div>
        

       </ScrollArea>
       </div>
      

        </div>
  )
}

export default LeftSidebar